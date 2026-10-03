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
 *   - `vecu`    : le sid de SON vécu embarqué. Une incarnation de figure a toujours un vécu et
 *                 un seul ; ce vécu porte la période de l'incarnation, et son propre degré.
 *                 Une fraternité, qui ne vit pas de vécus, a des incarnations sans vécu ;
 *   - `actif`   : l'incarnation compte-t-elle pour l'acteur ;
 *   - `rang`    : sa place dans la chronologie — le plus grand est le plus récent ;
 *   - `apports` : les autres items acquis pendant l'incarnation, `{ sid, degre }`, le degré
 *                 étant celui acquis pendant l'incarnation (null pour un focus, une capacité).
 *
 * Les enchaînements :
 *   - créer une incarnation depuis un vécu : elle prend la période du vécu ;
 *   - donner un vécu à une incarnation : le vécu prend la période de l'incarnation ;
 *   - changer la période d'une incarnation : son vécu la suit ;
 *   - supprimer le vécu d'une incarnation la supprime ; supprimer une incarnation supprime
 *     son vécu, et les items qui ne doivent rien à une autre incarnation.
 *
 * Un item embarqué n'existe qu'en un exemplaire : ce sont les apports qui portent l'historique.
 * L'ordre « de chaîne » va de la plus récente à la plus ancienne, comme l'ancienne chaîne de
 * `previous` ; `ordonnees` le conserve.
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
     * Les types d'acteur qui vivent des incarnations, et ceux dont chaque incarnation a un vécu.
     */
    static ACTEURS = ['figure', 'fraternite'];
    static AVEC_VECU = ['figure'];

    /**
     * Les raisons pour lesquelles une incarnation ne peut être créée depuis un vécu.
     */
    static SANS_PERIODE = "Le vécu doit avoir une période pour pouvoir être déposé";
    static PERIODE_INCONNUE = "La période auquelle est rattachée le vécu n'existe pas";
    static DEJA_VECU = "Le vécu existe déjà";

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
     * @returns the embedded vecu of the incarnation, null if none.
     */
    vecuDe(cle) {
        const sid = Version.data(this.incarnation(cle))?.vecu;
        return sid == null ? null : this.actor.items.find(i => i.type === 'vecu' && i.sid === sid) ?? null;
    }

    /**
     * @param vecu An embedded vecu.
     * @returns the incarnation whose vecu it is, null if none.
     */
    incarnationDe(vecu) {
        if (vecu?.sid == null) return null;
        return this.toutes().find(i => Version.data(i).vecu === vecu.sid) ?? null;
    }

    /**
     * @returns all the incarnations, in no particular order.
     */
    toutes() {
        return this.actor.items.filter(i => i.type === 'incarnation');
    }

    /**
     * @returns the incarnations in chain order: from the most recent to the oldest.
     */
    #chaine() {
        return this.toutes().sort((a, b) => (Version.data(b).rang ?? 0) - (Version.data(a).rang ?? 0));
    }

    /**
     * @returns the most recent incarnation, null if none.
     */
    premiere() {
        return this.#chaine()[0] ?? null;
    }

    /**
     * @param cle The key of an incarnation, null for the head of the chain.
     * @returns the incarnation which follows the specified one in chain order, null if none.
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
     * @param chrono True for chronological order, false for antichronological, null for the
     *               display order, which follows the option chronologieDescendante.
     * @param actif  True for active incarnations only, false for passive ones, null for all.
     *               The bounding one is always included, whatever its activation.
     * @param jusqua The key of the last incarnation included, null for no bound.
     * @returns the sorted incarnations.
     */
    ordonnees({ chrono = true, actif = null, jusqua = null } = {}) {

        // Retrieve if the display order must be inverted.
        // chrono === null : ordre d'affichage, piloté par l'option chronologieDescendante.
        const descendante = Version.data(this.actor).options?.chronologieDescendante === true;
        const inverse = (chrono === null)
            ? !descendante
            : ((chrono === true  && descendante === false)
            || (chrono === false && descendante === true));

        let periodes = [];
        let found = false;

        for (const p of this.#chaine()) {

            // Check if the last periode
            if (jusqua != null && found === false && jusqua === p.sid) {
                found = true;
            }

            // Skip the first periodes to the last if inverse order.
            // Sans limite (jusqua == null), il n'y a aucune periode a ignorer.
            if (inverse === true && jusqua != null && found === false) {
                continue;
            }

            // Add periode if required
            if (actif == null || jusqua === p.sid || Version.data(p).actif === actif) {
                periodes.push(p);
            }

            // Skip the last periodes if the last and normal order
            if (inverse === false && found === true && jusqua === p.sid) {
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
     *          contribution — in chain order.
     */
    #porteuses(sid) {
        return this.#chaine().filter(i => Version.data(i).vecu === sid
            || (Version.data(i).apports ?? []).some(a => a.sid === sid));
    }

    /**
     * @param item An embedded item.
     * @returns {string|null} la clé de l'incarnation à laquelle l'item est rattaché — la plus
     *          récente s'il a progressé pendant plusieurs.
     */
    rattachement(item) {
        return this.#porteuses(item?.sid)[0]?.sid ?? null;
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
        return data?.vecu === sid || (data?.apports ?? []).some(a => a.sid === sid);
    }

    /**
     * @param cle   The key of an incarnation.
     * @param types The item types to keep, all if omitted.
     * @returns the embedded items which owe something to the incarnation — its vecu first —
     *          in actor order.
     */
    rattaches(cle, types = null) {
        const data = Version.data(this.incarnation(cle));
        const sids = new Set((data?.apports ?? []).map(a => a.sid));
        if (data?.vecu != null) sids.add(data.vecu);
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
     * @returns the degre acquired by the item during the incarnation, 0 if none. The vecu of
     *          the incarnation carries its own degre; so does an item whose contribution has
     *          none (focus, capacite).
     */
    degreDans(sid, cle) {
        const data = Version.data(this.incarnation(cle));
        if (data?.vecu === sid) return Version.data(this.exemplaires(sid)[0])?.degre ?? 0;
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
     * vécu est embarqué avec elle. Elle devient la plus récente, et la courante si c'est la
     * première.
     * @param sid The system identifier of the world vecu.
     * @returns {string|null} la raison d'un refus (voir SANS_PERIODE...), null si créée.
     */
    async creerDepuisVecu(sid) {
        if (this.exemplaires(sid).length > 0) return Incarnations.DEJA_VECU;
        const monde = game.items.find(i => i.type === 'vecu' && i.sid === sid);
        const periode = Version.data(monde)?.periode ?? null;
        if (periode == null) return Incarnations.SANS_PERIODE;
        if (game.items.find(i => i.type === 'periode' && i.sid === periode) == null) return Incarnations.PERIODE_INCONNUE;
        await this.#embarquerVecu(monde, periode);
        await this.#creer(periode, sid);
        return null;
    }

    /**
     * Crée une incarnation sans vécu — pour une fraternité, qui n'en vit pas.
     * @param periode The system identifier of the world periode.
     * @returns {string|null} la clé de l'incarnation créée.
     */
    async ajouter(periode) {
        if (Incarnations.AVEC_VECU.includes(this.actor.type)) return null;
        if (game.items.find(i => i.type === 'periode' && i.sid === periode) == null) return null;
        return await this.#creer(periode, null);
    }

    /**
     * Donne à une incarnation un autre vécu : il prend la période de l'incarnation, et
     * l'ancien vécu quitte l'acteur.
     * @param cle The key of the incarnation.
     * @param sid The system identifier of the world vecu.
     * @returns {string|null} la raison d'un refus, null si fait.
     */
    async definirVecu(cle, sid) {
        const incarnation = this.incarnation(cle);
        const monde = game.items.find(i => i.type === 'vecu' && i.sid === sid);
        if (incarnation == null || monde == null) return null;
        if (this.exemplaires(sid).length > 0) return Incarnations.DEJA_VECU;
        const ancien = this.vecuDe(cle);
        await this.#embarquerVecu(monde, Version.data(incarnation).periode);
        // Le nouveau vécu est posé avant que l'ancien parte : sa suppression n'emporte plus
        // l'incarnation.
        await incarnation.update({ [Version.path(incarnation, 'vecu')]: sid });
        if (ancien != null) {
            await this.actor.deleteVecu(ancien);
        }
        return null;
    }

    /**
     * Change la période d'une incarnation : son vécu la suit.
     * @param cle     The key of the incarnation.
     * @param periode The system identifier of the world periode.
     */
    async changerPeriode(cle, periode) {
        const incarnation = this.incarnation(cle);
        const monde = game.items.find(i => i.type === 'periode' && i.sid === periode);
        if (incarnation == null || monde == null) return;
        await incarnation.update({ name: monde.name, img: monde.img, [Version.path(incarnation, 'periode')]: periode });
        const vecu = this.vecuDe(cle);
        if (vecu != null) {
            await vecu.update({ [Version.path(vecu, 'periode')]: periode });
        }
    }

    /**
     * Retire une incarnation : son vécu part avec elle, et les items qui ne doivent rien à
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
            Version.data(i).vecu === item.sid || (Version.data(i).apports ?? []).some(a => a.sid === item.sid)));

        // Delete the incarnation first: its vecu no longer holds it, and the other items lose
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
     * @param vecu    The system identifier of the embedded vecu, null for none.
     * @returns {string} la clé de l'incarnation créée.
     */
    async #creer(periode, vecu) {
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
                        vecu: vecu,
                        actif: true,
                        rang: premiere == null ? 0 : (Version.data(premiere).rang ?? 0) + 1,
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
     */
    async #embarquerVecu(monde, periode) {
        await new EmbeddedItem(this.actor, monde.sid)
            .withContext("Drop of a vecu on periode " + periode)
            .withData("degre", 0)
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
     * Déplace une incarnation dans la chronologie : en ordre de chaîne, juste derrière une autre.
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

        // Move the incarnation just behind its new parent, then number the chain again
        const ordre = chaine.filter(i => i.sid !== cle);
        ordre.splice(ordre.findIndex(i => i.sid === parent) + 1, 0, moved);
        const updates = [];
        ordre.forEach((item, i) => {
            const rang = ordre.length - 1 - i;
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
     * Un vécu ne se rattache pas ainsi : voir creerDepuisVecu et definirVecu.
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
        return this.#porteuses(sid).filter(i => i.sid !== cle || Version.data(i).vecu === sid).length;
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
        if (Version.data(incarnation).vecu === item.sid) {
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
     * Garde les incarnations en accord avec les items, quel que soit le chemin de suppression :
     * le vécu d'une incarnation supprimé l'emporte — une incarnation de figure a toujours un
     * vécu ; tout autre item supprimé ne doit plus rien à aucune incarnation, sans quoi un
     * apport orphelin le ferait revivre à son prochain dépôt. Les suppressions qui s'en
     * chargent elles-mêmes passent l'option `incarnations: false`.
     */
    static ecouter() {
        Hooks.on('deleteItem', (item, options, userId) => {
            if (userId !== game.user.id || options?.incarnations === false) return;
            if (item.parent == null || item.type === 'incarnation' || item.type === 'periode') return;
            const incarnations = new Incarnations(item.parent);
            if (!incarnations.porte || incarnations.exemplaires(item.sid).length > 0) return;
            const tenue = item.type === 'vecu' ? incarnations.incarnationDe(item) : null;
            if (tenue != null) {
                incarnations.retirer(tenue.sid);
            } else {
                incarnations.oublier(item.sid);
            }
        });
    }

    // ------------------------------------------------------------------ l'affichage

    /**
     * @returns the incarnations and their attached items, as displayed by the incarnations tab.
     */
    chronologie() {

        const all = [];
        for (const p of this.ordonnees()) {

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
