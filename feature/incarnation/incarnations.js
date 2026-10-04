import { DocumentIdentifier } from "../../module/common/documentIdentifier.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Version } from "../../module/common/version.js";

/**
 * Les incarnations d'un acteur, vues d'un seul endroit.
 *
 * Une incarnation est un item `incarnation` embarqué sur l'acteur. Elle a sa propre identité :
 * son sid, la CLÉ par laquelle tout le reste la désigne — la période courante de l'acteur
 * (`actor.periode`), les variables `periode` des features, l'effectif d'une fraternité. Elle
 * porte, en v5 :
 *
 *   - `periode` : le sid de la période du monde qu'elle incarne ; plusieurs incarnations
 *                 peuvent porter la même ;
 *   - `vecus`   : les sids de SES vécus embarqués — aucun, un ou plusieurs ; chacun porte la
 *                 période de l'incarnation, et son propre degré ;
 *   - `actif`   : l'incarnation compte-t-elle pour l'acteur ;
 *   - `rang`    : sa place dans la chronologie — le plus grand est le plus récent ;
 *   - `apports` : les autres items acquis pendant l'incarnation, `{ sid, degre }`, le degré
 *                 étant celui acquis pendant l'incarnation (null pour un focus, une capacité).
 *
 * Les enchaînements :
 *   - créer une incarnation depuis un vécu : elle prend la période du vécu ;
 *   - ajouter un vécu à une incarnation : le vécu prend la période de l'incarnation ;
 *   - changer la période d'une incarnation : ses vécus la suivent ;
 *   - retirer un vécu, ou le supprimer par un autre chemin : l'incarnation le lâche ; elle peut
 *     rester sans vécu ; supprimer une incarnation supprime ses vécus, et les items qui ne
 *     doivent rien à une autre incarnation.
 *
 * Un item embarqué n'existe qu'en un exemplaire : ce sont les apports qui portent l'historique.
 * L'ordre « de chaîne » est l'ordre chronologique, de la plus ancienne à la plus récente, comme
 * l'ancienne chaîne de `previous` (sa tête, sans prédécesseur, était la plus ancienne). Une
 * incarnation déposée prend la tête : elle devient la plus ancienne, comme une période déposée
 * sur v14 — on découvre ses vies passées en remontant le temps.
 *
 * Pour les calculs comptent l'incarnation courante et les incarnations ANTÉRIEURES non
 * désactivées ; les postérieures jamais. L'option chronologieDescendante ne règle que l'ordre
 * d'affichage.
 *
 * Cette classe est la seule à connaître cette représentation. Une instance est faite pour être
 * utilisée sur le champ, puis jetée : elle ne met rien en cache.
 */
export class Incarnations {

    /**
     * Les types d'items affichés pour une incarnation, par rubrique de la fiche. Les premiers
     * acquièrent un degré pendant l'incarnation ; les autres y sont seulement rattachés.
     */
    static VECUS = ['vecu', 'savoir', 'quete', 'arcane', 'chute', 'science', 'passe'];
    static FOCUS = ['sort', 'invocation', 'formule', 'rite', 'ordonnance', 'appel', 'habitus', 'pratique',
        'rituel', 'technique', 'tekhne', 'atlanteide', 'dracomachie', 'divination'];
    static CAPACITES = ['capacite'];

    /**
     * Les types d'acteur qui vivent des incarnations.
     */
    static ACTEURS = ['figure', 'fraternite'];

    /**
     * Les raisons pour lesquelles une incarnation ne peut être créée depuis un vécu.
     */
    static SANS_PERIODE = "Le vécu doit avoir une période pour pouvoir être déposé";
    static PERIODE_INCONNUE = "La période auquelle est rattachée le vécu n'existe pas";
    static DEJA_VECU = "Le vécu existe déjà";
    static VECU_INCONNU = "Le vécu n'existe pas dans le monde";

    /**
     * @param actor The actor whose incarnations to read or write.
     */
    constructor(actor) {
        this.actor = actor;
    }

    /**
     * @returns true if the actor lives incarnations. A figurant does not: the degre of its
     *          items is carried by the items themselves.
     */
    get porte() {
        return Incarnations.ACTEURS.includes(this.actor?.type);
    }

    // ------------------------------------------------------------------ les incarnations

    /**
     * @returns {string|null} la clé de l'incarnation courante, null si aucune.
     */
    get courante() {
        return Version.data(this.actor).periode ?? null;
    }

    /**
     * @param cle The key of the incarnation.
     * @returns the incarnation, null if none.
     */
    incarnation(cle) {
        if (cle == null) return null;
        return this.actor.items.find(i => i.type === 'incarnation' && i.sid === cle) ?? null;
    }

    /**
     * @param cle The key of the incarnation.
     * @returns {string|null} le sid de la période du monde que l'incarnation incarne.
     */
    periodeDe(cle) {
        return Version.data(this.incarnation(cle))?.periode ?? null;
    }

    /**
     * @param cle The key of the incarnation.
     * @returns the sids of its vecus.
     */
    #sidsVecus(cle) {
        return Version.data(this.incarnation(cle))?.vecus ?? [];
    }

    /**
     * @param cle The key of the incarnation.
     * @returns the embedded vecus of the incarnation, in actor order.
     */
    vecusDe(cle) {
        const sids = this.#sidsVecus(cle);
        return this.actor.items.filter(i => i.type === 'vecu' && sids.includes(i.sid));
    }

    /**
     * @param vecu An embedded vecu.
     * @returns the incarnation to which the vecu belongs, null if none.
     */
    incarnationDe(vecu) {
        if (vecu?.sid == null) return null;
        return this.toutes().find(i => (Version.data(i).vecus ?? []).includes(vecu.sid)) ?? null;
    }

    /**
     * @returns all the incarnations, in no particular order.
     */
    toutes() {
        return this.actor.items.filter(i => i.type === 'incarnation');
    }

    /**
     * @returns the incarnations in chain order: from the oldest to the most recent.
     */
    #chaine() {
        return this.toutes().sort((a, b) => (Version.data(a).rang ?? 0) - (Version.data(b).rang ?? 0));
    }

    /**
     * @returns the oldest incarnation, the head of the chain, null if none.
     */
    premiere() {
        return this.#chaine()[0] ?? null;
    }

    /**
     * @param cle The key of an incarnation, null for the head of the chain.
     * @returns the incarnation which follows the specified one in chain order — the next more
     *          recent — null if none.
     */
    suivante(cle) {
        const chaine = this.#chaine();
        if (cle == null) return chaine[0] ?? null;
        const index = chaine.findIndex(i => i.sid === cle);
        return index === -1 ? null : chaine[index + 1] ?? null;
    }

    /**
     * Les incarnations dans l'ordre, filtrées et bornées.
     *
     * @param chrono True for chronological order (from the oldest to the bound), false for the
     *               reverse, null for the display order, which follows the option
     *               chronologieDescendante — the only use of that option.
     * @param actif  True for active incarnations only, false for passive ones, null for all.
     *               The bounding one is always included, whatever its activation.
     * @param jusqua The key of the last incarnation included, null for no bound: the
     *               incarnations more recent than it are never read.
     * @returns the sorted incarnations.
     */
    ordonnees({ chrono = true, actif = null, jusqua = null } = {}) {

        // Retrieve if the most recent incarnation comes first
        const descendante = Version.data(this.actor).options?.chronologieDescendante === true;
        const inverse = (chrono === null) ? !descendante : (chrono === false);

        // Retrieve incarnations from the oldest to the last one
        let periodes = [];

        for (const p of this.#chaine()) {

            // Add periode if required
            if (actif == null || jusqua === p.sid || Version.data(p).actif === actif) {
                periodes.push(p);
            }

            // The incarnations more recent than the last one are skipped
            if (jusqua != null && jusqua === p.sid) {
                break;
            }
        }

        // Sort the periodes according to the order
        if (inverse === true) {
            periodes = periodes.reverse();
        }

        return periodes;
    }

    /**
     * Une incarnation compte si elle est activée et ne vient pas après la courante.
     * @param cle The key of the incarnation.
     * @returns true if the incarnation counts for the actor.
     */
    estActive(cle) {
        if (cle == null) return false;
        const p = this.ordonnees({ actif: true, jusqua: this.courante }).find(i => i.sid === cle);
        return p != null && Version.data(p).actif === true;
    }

    // ------------------------------------------------------------------ les rattachements

    /**
     * @param sid The system identifier of an item.
     * @returns the incarnations to which the item owes something — as their vecu or as a
     *          contribution — in chain order, from the oldest.
     */
    #porteuses(sid) {
        return this.#chaine().filter(i => (Version.data(i).vecus ?? []).includes(sid)
            || (Version.data(i).apports ?? []).some(a => a.sid === sid));
    }

    /**
     * @param item An embedded item.
     * @returns {string|null} la clé de l'incarnation à laquelle l'item est rattaché — la plus
     *          récente s'il a progressé pendant plusieurs.
     */
    rattachement(item) {
        return this.#porteuses(item?.sid).at(-1)?.sid ?? null;
    }

    /**
     * @param item An embedded item.
     * @returns true if the item owes something to an incarnation which counts.
     */
    estActif(item) {
        return this.#porteuses(item?.sid).some(i => this.estActive(i.sid));
    }

    /**
     * @param sid The system identifier of an item.
     * @returns the embedded items with this sid — one, since an item is embedded once.
     */
    exemplaires(sid) {
        return this.actor.items.filter(i => i.sid === sid && i.type !== 'incarnation');
    }

    /**
     * @param sid The system identifier of an item.
     * @param cle The key of an incarnation.
     * @returns true if the item owes something to the incarnation.
     */
    aRattache(sid, cle) {
        const data = Version.data(this.incarnation(cle));
        return (data?.vecus ?? []).includes(sid) || (data?.apports ?? []).some(a => a.sid === sid);
    }

    /**
     * @param cle   The key of an incarnation.
     * @param types The item types to keep, all if omitted.
     * @returns the embedded items which owe something to the incarnation — its vecus and its
     *          contributions — in actor order.
     */
    rattaches(cle, types = null) {
        const data = Version.data(this.incarnation(cle));
        const sids = new Set((data?.apports ?? []).map(a => a.sid));
        for (const vecu of data?.vecus ?? []) sids.add(vecu);
        return this.actor.items.filter(i => i.type !== 'incarnation' && sids.has(i.sid)
            && (types == null || types.includes(i.type)));
    }

    /**
     * Ce qu'un item doit à chaque incarnation, active ou non.
     * @param sid The system identifier of an item.
     * @returns the contributions, as { item, periode, degre }, periode being the key of the
     *          incarnation.
     */
    apports(sid) {
        const item = this.exemplaires(sid)[0] ?? null;
        return this.#porteuses(sid).map(i => ({
            item: item,
            periode: i.sid,
            degre: this.degreDans(sid, i.sid)
        }));
    }

    /**
     * @param sid The system identifier of an item.
     * @param cle The key of an incarnation.
     * @returns the degre acquired by the item during the incarnation, 0 if none. A vecu of
     *          the incarnation carries its own degre; so does an item whose contribution has
     *          none (focus, capacite).
     */
    degreDans(sid, cle) {
        const data = Version.data(this.incarnation(cle));
        if ((data?.vecus ?? []).includes(sid)) return Version.data(this.exemplaires(sid)[0])?.degre ?? 0;
        const apport = (data?.apports ?? []).find(a => a.sid === sid);
        if (apport == null) return 0;
        return apport.degre ?? Version.data(this.exemplaires(sid)[0])?.degre ?? 0;
    }

    /**
     * @param sid The system identifier of an item.
     * @returns the degre of the item, summed over the incarnations which count.
     */
    degre(sid) {
        return this.apports(sid)
            .filter(a => this.estActive(a.periode))
            .reduce((total, a) => total + a.degre, 0);
    }

    /**
     * Le degré d'un item tel que l'acteur l'a acquis, toutes incarnations confondues — celui
     * d'un vécu, qui n'appartient qu'à une incarnation. Pour un acteur sans incarnations, le
     * degré porté par l'item lui-même.
     * @param item An embedded item.
     * @returns the acquired degre.
     */
    degreAcquis(item) {
        if (!this.porte) return Version.data(item).degre;
        return this.apports(item.sid).reduce((total, a) => total + a.degre, 0);
    }

    /**
     * @returns the embedded vecus whose incarnation counts.
     */
    vecusActifs() {
        return this.actor.items.filter(i => i.type === 'vecu' && this.estActif(i));
    }

    // ------------------------------------------------------------------ créer, supprimer

    /**
     * Crée une incarnation à partir d'un vécu du monde : elle prend la période du vécu, et le
     * vécu est embarqué avec elle. Elle prend la tête de la chaîne — la plus ancienne —, et
     * devient la courante si c'est la première.
     * @param sid The system identifier of the world vecu.
     * @returns {string|null} la raison d'un refus (voir SANS_PERIODE...), null si créée.
     */
    async creerDepuisVecu(sid) {
        if (this.exemplaires(sid).length > 0) return Incarnations.DEJA_VECU;
        const monde = game.items.find(i => i.type === 'vecu' && i.sid === sid);
        const periode = Version.data(monde)?.periode ?? null;
        if (periode == null) return Incarnations.SANS_PERIODE;
        return (await this.creerAvecVecu(periode, sid)).refus;
    }

    /**
     * Crée une incarnation à partir d'une période et d'un vécu choisis séparément — par le
     * formulaire d'incarnation : le vécu est embarqué avec la période de l'incarnation, et le
     * degré donné. Elle prend la tête de la chaîne, et devient la courante si c'est la première.
     * @param periode The system identifier of the world periode.
     * @param sid     The system identifier of the world vecu.
     * @param degre   The degre of the vecu.
     * @returns {{ cle: string|null, refus: string|null }} la clé de l'incarnation créée, ou la
     *          raison d'un refus.
     */
    async creerAvecVecu(periode, sid, degre = 0) {
        if (this.exemplaires(sid).length > 0) return { cle: null, refus: Incarnations.DEJA_VECU };
        const monde = game.items.find(i => i.type === 'vecu' && i.sid === sid);
        if (monde == null) return { cle: null, refus: Incarnations.VECU_INCONNU };
        if (game.items.find(i => i.type === 'periode' && i.sid === periode) == null) {
            return { cle: null, refus: Incarnations.PERIODE_INCONNUE };
        }
        await this.#embarquerVecu(monde, periode, degre);
        return { cle: await this.#creer(periode, [sid]), refus: null };
    }

    /**
     * Crée une incarnation sans vécu, à partir de sa seule période. Elle prend la tête de la
     * chaîne, et devient la courante si c'est la première.
     * @param periode The system identifier of the world periode.
     * @returns {string|null} la clé de l'incarnation créée.
     */
    async ajouter(periode) {
        if (game.items.find(i => i.type === 'periode' && i.sid === periode) == null) return null;
        return await this.#creer(periode, []);
    }

    /**
     * Ajoute un vécu à une incarnation : il prend la période de l'incarnation.
     * @param cle   The key of the incarnation.
     * @param sid   The system identifier of the world vecu.
     * @param degre The degre of the vecu.
     * @returns {string|null} la raison d'un refus, null si fait.
     */
    async ajouterVecu(cle, sid, degre = 0) {
        const incarnation = this.incarnation(cle);
        if (incarnation == null) return null;
        if (this.exemplaires(sid).length > 0) return Incarnations.DEJA_VECU;
        const monde = game.items.find(i => i.type === 'vecu' && i.sid === sid);
        if (monde == null) return Incarnations.VECU_INCONNU;
        await this.#embarquerVecu(monde, Version.data(incarnation).periode, degre);
        await incarnation.update({ [Version.path(incarnation, 'vecus')]: [...this.#sidsVecus(cle), sid] });
        return null;
    }

    /**
     * Retire un vécu d'une incarnation, et de la figure. L'incarnation peut rester sans vécu.
     * @param cle The key of the incarnation.
     * @param sid The system identifier of the vecu.
     */
    async retirerVecu(cle, sid) {
        const incarnation = this.incarnation(cle);
        const vecus = this.#sidsVecus(cle);
        if (incarnation == null || !vecus.includes(sid)) return;
        // L'incarnation le lâche avant qu'il parte : sa suppression ne la concerne plus.
        await incarnation.update({ [Version.path(incarnation, 'vecus')]: vecus.filter(v => v !== sid) });
        const vecu = this.exemplaires(sid)[0];
        if (vecu != null) {
            await this.actor.deleteVecu(vecu);
        }
    }

    /**
     * Change la période d'une incarnation : ses vécus la suivent.
     * @param cle     The key of the incarnation.
     * @param periode The system identifier of the world periode.
     */
    async changerPeriode(cle, periode) {
        const incarnation = this.incarnation(cle);
        const monde = game.items.find(i => i.type === 'periode' && i.sid === periode);
        if (incarnation == null || monde == null) return;
        await incarnation.update({ name: monde.name, img: monde.img, [Version.path(incarnation, 'periode')]: periode });
        for (const vecu of this.vecusDe(cle)) {
            await vecu.update({ [Version.path(vecu, 'periode')]: periode });
        }
    }

    /**
     * Retire une incarnation : ses vécus partent avec elle, et les items qui ne doivent rien à
     * une autre incarnation ; les autres perdent seulement cet apport.
     * @param cle The key of the incarnation.
     */
    async retirer(cle) {

        const incarnation = this.incarnation(cle);
        if (incarnation == null) return;

        // Remove the current incarnation if necessary
        if (this.courante === cle) {
            await this.definirCourante(null);
        }

        // The items which owe nothing to another incarnation go with this one
        const autres = this.toutes().filter(i => i.sid !== cle);
        const orphelins = this.rattaches(cle).filter(item => !autres.some(i =>
            (Version.data(i).vecus ?? []).includes(item.sid) || (Version.data(i).apports ?? []).some(a => a.sid === item.sid)));

        // Delete the incarnation first: its vecus no longer hold it, and the other items lose
        // their contribution with it
        await this.actor.deleteEmbeddedDocuments('Item', [incarnation.id]);

        // Delete the vecus, with their dependencies
        for (const vecu of orphelins.filter(i => i.type === 'vecu')) {
            await this.actor.deleteVecu(vecu);
        }

        // Delete the other items
        const ids = orphelins.filter(i => i.type !== 'vecu').map(i => i.id);
        if (ids.length > 0) {
            await this.actor.deleteEmbeddedDocuments('Item', ids);
        }
    }

    /**
     * @param periode The system identifier of the world periode.
     * @param vecus   The system identifiers of the embedded vecus, none for a fraternite.
     * @returns {string} la clé de l'incarnation créée.
     */
    async #creer(periode, vecus) {
        const monde = game.items.find(i => i.type === 'periode' && i.sid === periode);
        const premiere = this.premiere();
        // Sans system.id, l'item reçoit un identifiant neuf à sa création (NephilimItem._preCreate).
        const [cree] = await this.actor.createEmbeddedDocuments('Item', [{
            name: monde?.name ?? periode,
            type: 'incarnation',
            img: monde?.img,
            system: {
                versions: {
                    v5: {
                        periode: periode,
                        vecus: vecus,
                        actif: true,
                        rang: premiere == null ? 0 : (Version.data(premiere).rang ?? 0) - 1,
                        apports: []
                    }
                }
            }
        }]);
        if (premiere == null) {
            await this.definirCourante(cree.sid);
        }
        return cree.sid;
    }

    /**
     * Embarque un vécu du monde, avec la période de son incarnation.
     * @param monde   The world vecu.
     * @param periode The system identifier of the world periode.
     * @param degre   The degre of the vecu.
     */
    async #embarquerVecu(monde, periode, degre = 0) {
        await new EmbeddedItem(this.actor, monde.sid)
            .withContext("Drop of a vecu on periode " + periode)
            .withData("degre", degre)
            .withData("mnemos", [])
            .withData("periode", periode)
            .withData("element", Version.data(monde).element)
            .withoutData('description')
            .create();
    }

    // ------------------------------------------------------------------ les autres écritures

    /**
     * @param cle The key of the incarnation to make current, null for none.
     */
    async definirCourante(cle) {
        await this.actor.update({ [Version.path(this.actor, 'periode')]: cle });
    }

    /**
     * Déplace une incarnation dans la chronologie : juste après une autre, c'est-à-dire juste
     * plus récente qu'elle.
     * @param cle    The key of the incarnation to move.
     * @param parent The key of the incarnation which will precede it.
     */
    async deplacer(cle, parent) {

        const chaine = this.#chaine();
        const moved = chaine.find(i => i.sid === cle);
        const index = chaine.findIndex(i => i.sid === parent);

        // The target is not an incarnation, or the move changes nothing
        if (moved == null || index === -1 || cle === parent || chaine[index + 1]?.sid === cle) {
            return;
        }

        // Move the incarnation just after its new parent, then number the chain again
        const ordre = chaine.filter(i => i.sid !== cle);
        ordre.splice(ordre.findIndex(i => i.sid === parent) + 1, 0, moved);
        const updates = [];
        ordre.forEach((item, i) => {
            const rang = i;
            if (Version.data(item).rang !== rang) {
                updates.push({ _id: item.id, [Version.path(item, 'rang')]: rang });
            }
        });
        if (updates.length > 0) {
            await this.actor.updateEmbeddedDocuments('Item', updates);
        }
    }

    /**
     * @param cle The key of the incarnation to activate or deactivate.
     */
    async basculer(cle) {
        const incarnation = this.incarnation(cle);
        if (incarnation == null) return;
        await incarnation.update({ [Version.path(incarnation, 'actif')]: !Version.data(incarnation).actif });
    }

    /**
     * Rattache un item embarqué à une incarnation, comme apport. Sans effet s'il l'est déjà.
     * Un vécu ne se rattache pas ainsi : voir creerDepuisVecu, creerAvecVecu et ajouterVecu.
     * @param sid   The system identifier of the embedded item.
     * @param cle   The key of the incarnation.
     * @param degre The degre acquired during the incarnation, null if the item has none.
     */
    async rattacher(sid, cle, degre = null) {
        const incarnation = this.incarnation(cle);
        if (incarnation == null || this.aRattache(sid, cle)) return;
        await this.#apports(incarnation, [...(Version.data(incarnation).apports ?? []), { sid: sid, degre: degre }]);
    }

    /**
     * Retire à une incarnation l'apport d'un item.
     * @param sid The system identifier of the embedded item.
     * @param cle The key of the incarnation.
     * @returns the number of incarnations to which the item still owes something.
     */
    async detacher(sid, cle) {
        const incarnation = this.incarnation(cle);
        const apports = Version.data(incarnation)?.apports ?? [];
        if (apports.some(a => a.sid === sid)) {
            await this.#apports(incarnation, apports.filter(a => a.sid !== sid));
        }
        return this.#porteuses(sid).filter(i => i.sid !== cle || (Version.data(i).vecus ?? []).includes(sid)).length;
    }

    /**
     * Retire à toutes les incarnations l'apport d'un item — l'item a quitté l'acteur.
     * @param sid The system identifier of the embedded item.
     */
    async oublier(sid) {
        const updates = this.toutes()
            .filter(i => (Version.data(i).apports ?? []).some(a => a.sid === sid))
            .map(i => ({ _id: i.id, [Version.path(i, 'apports')]: Version.data(i).apports.filter(a => a.sid !== sid) }));
        if (updates.length > 0) {
            await this.actor.updateEmbeddedDocuments('Item', updates);
        }
    }

    /**
     * @param item  The embedded item which owes something to the incarnation.
     * @param degre The degre acquired during the incarnation.
     * @param cle   The key of the incarnation, the current one if omitted.
     */
    async modifierDegre(item, degre, cle = this.courante) {
        const incarnation = this.incarnation(cle);
        if (incarnation == null) return;
        if ((Version.data(incarnation).vecus ?? []).includes(item.sid)) {
            await item.update({ [Version.path(item, 'degre')]: degre });
            return;
        }
        await this.#apports(incarnation, (Version.data(incarnation).apports ?? [])
            .map(a => a.sid === item.sid ? { sid: a.sid, degre: degre } : a));
    }

    /**
     * @param incarnation The incarnation to update.
     * @param apports     Its new contributions.
     */
    async #apports(incarnation, apports) {
        await incarnation.update({ [Version.path(incarnation, 'apports')]: apports });
    }

    /**
     * Garde les incarnations en accord avec un item embarqué qu'on vient de supprimer, quel que
     * soit le chemin de suppression : un vécu supprimé est lâché par son incarnation ; tout
     * autre item supprimé ne doit plus rien à
     * aucune incarnation, sans quoi un apport orphelin le ferait revivre à son prochain dépôt.
     *
     * Appelée par NephilimItem._onDeleteOperation, une fois par item supprimé, l'un après
     * l'autre et sur un seul client. Les suppressions qui s'en chargent elles-mêmes passent
     * l'option `incarnations: false`.
     * @param item The deleted embedded item.
     */
    static async apresSuppression(item) {
        if (item.type === 'incarnation' || item.type === 'periode') return;
        const incarnations = new Incarnations(item.actor);
        if (!incarnations.porte || incarnations.exemplaires(item.sid).length > 0) return;
        const tenue = item.type === 'vecu' ? incarnations.incarnationDe(item) : null;
        if (tenue == null) {
            await incarnations.oublier(item.sid);
            return;
        }
        // Un vécu supprimé est lâché par son incarnation, qui peut rester sans vécu
        await tenue.update({ [Version.path(tenue, 'vecus')]: (Version.data(tenue).vecus ?? []).filter(v => v !== item.sid) });
    }

    // ------------------------------------------------------------------ l'affichage

    /**
     * @returns the incarnations and their attached items, as displayed by the incarnations tab.
     */
    chronologie() {

        const all = [];
        for (const p of this.ordonnees({ chrono: null })) {

            // Retrieve the periode of the world
            const periode = game.items.find(i => i.sid === Version.data(p).periode);
            if (periode == null) {
                continue;
            }

            const vecus = this.#lignes(p.sid, Incarnations.VECUS, true);
            const focus = this.#lignes(p.sid, Incarnations.FOCUS, false);
            const capacites = this.#lignes(p.sid, Incarnations.CAPACITES, false);

            // Create all linked actors
            const actors = [];
            if (this.actor.type === 'fraternite') {
                for (const fa of Version.data(this.actor).effectif.filter(a => a.periode === p.sid)) {
                    const original = game.actors.find(a => a.sid === fa.actor);
                    if (original == null) {
                        continue;
                    }
                    actors.push({
                        id: original.id,
                        sid: original.sid,
                        name: original.name,
                        status: fa.status,
                        newer: this.actor.isNewMember(original.id, p.sid)
                    });
                }
            }

            all.push({
                cle: p.sid,
                original: {
                    name: periode.name,
                    id: periode.id,
                    sid: periode.sid,
                    contexte: Version.data(periode).contexte,
                    aube: Version.data(periode).aube
                },
                embedded: {
                    id: p.id,
                    fsid: new DocumentIdentifier(p).fsid,
                    actif: Version.data(p).actif,
                    courante: this.courante === p.sid,
                    vecu: this.vecusDe(p.sid).map(v => v.name).join(", ") || null,
                    vecus: vecus,
                    focus: focus,
                    capacites: capacites,
                    actors: actors
                }
            });
        }

        return all;
    }

    /**
     * @param cle    The key of the incarnation.
     * @param types  The item types to list, in display order.
     * @param degre  True to add the degre acquired during the incarnation.
     * @returns the display lines of the items attached to the incarnation.
     */
    #lignes(cle, types, degre) {
        const lignes = [];
        for (const type of types) {
            for (const i of this.rattaches(cle, [type])) {
                const original = game.items.find(o => o.sid === i.sid);
                if (original == null) continue;
                const ligne = {
                    name: original.name,
                    type: original.type,
                    id: i.id,
                    wid: original.id,
                    sid: i.sid
                };
                if (degre) ligne.degre = this.degreDans(i.sid, cle);
                lignes.push(ligne);
            }
        }
        return lignes;
    }

}
