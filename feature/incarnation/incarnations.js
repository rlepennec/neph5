import { DocumentIdentifier } from "../../module/common/documentIdentifier.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Version } from "../../module/common/version.js";
import { IncarnationDataModel } from "./item/incarnation.mjs";

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
 *   - `actif`   : l'incarnation compte-t-elle pour l'acteur ;
 *   - `predecesseur`, `successeur` : les clés des incarnations immédiatement plus ancienne et
 *                 plus récente — une liste doublement chaînée, dont la tête (sans
 *                 prédécesseur) est la plus ancienne.
 *
 * Ce qui est lié à une incarnation — ses vécus, et ce qu'elle a acquis : savoirs, quêtes,
 * arcanes, chutes, sciences, ressources, focus, capacités (LIES) — n'est pas porté par elle :
 * chaque item lié a un exemplaire embarqué par incarnation qui le connaît, qui porte la clé de
 * son incarnation (`system.incarnation`, IncarnationField) et SES valeurs : le degré acquis
 * pendant elle, et pour un focus le statut, le focus, le pacte, la quantité... Un item est
 * ainsi désigné par la paire (clé de l'incarnation, sid). Le degré d'un item est la somme des
 * degrés de ses exemplaires dont l'incarnation compte ; l'exemplaire qui fait foi pour les
 * autres valeurs est celui de l'incarnation courante, sinon de l'antérieure la plus proche
 * (exemplaireEffectif) ; écrire une valeur la porte à l'incarnation courante (ecrire).
 *
 * Les enchaînements :
 *   - créer une incarnation depuis un vécu : elle prend la période du vécu ;
 *   - ajouter un vécu à une incarnation : le vécu vit la période de l'incarnation ; le vécu lié ne
 *     la recopie pas, elle se lit sur son incarnation (periodeDe(epoqueDe(vecu))) ;
 *   - changer la période d'une incarnation : ses vécus en changent du même coup ;
 *   - retirer un vécu, ou le supprimer par un autre chemin : l'incarnation peut rester sans
 *     vécu ; supprimer une incarnation supprime tous ses exemplaires, les autres incarnations
 *     gardant les leurs.
 *
 * L'ordre « de chaîne » est l'ordre chronologique, de la plus ancienne à la plus récente, comme
 * l'ancienne chaîne de `previous` (sa tête, sans prédécesseur, était la plus ancienne). Une
 * incarnation créée arrive en QUEUE : elle devient la plus récente (décidé le 19/10 ; elle
 * arrivait auparavant en tête), et reprend les Ka de l'antérieure active la plus proche.
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
     * Les voies, magique et alchimique : au plus une de chaque par incarnation, indépendamment
     * l'une de l'autre (voir voie et changerVoie).
     */
    static VOIES = ['magie', 'alchimie'];

    /**
     * Le métamorphe : au plus un par incarnation, comme une voie (voie et changerVoie). Ses
     * métamorphoses développées se transmettent avec lui ; ses yeux (visible) sont propres à
     * l'incarnation de l'exemplaire et ne se transmettent pas (voir Metamorphe).
     */
    static METAMORPHES = ['metamorphe'];

    /**
     * Les équipements, armes et armures : ils ne se transmettent pas d'une incarnation à
     * l'autre ; seuls comptent ceux de l'incarnation courante (voir equipements).
     */
    static EQUIPEMENTS = ['arme', 'armure'];

    /**
     * Les stocks, les materiae : ils se transmettent d'une incarnation à l'autre ; chaque
     * exemplaire porte la VARIATION de quantité de son époque, positive ou négative (voir stock).
     */
    static STOCKS = ['materiae'];

    /**
     * Les possessions, les catalyseurs et les aspects : elles se transmettent d'une incarnation à
     * l'autre, et peuvent se gagner, se perdre et se regagner ; chaque exemplaire marque la
     * possession à son époque (`possede`). Au plus un exemplaire de chaque par incarnation (voir
     * possessions).
     */
    static POSSESSIONS = ['catalyseur', 'aspect'];

    /**
     * Tous les types liés à une incarnation : un exemplaire embarqué par incarnation qui les
     * connaît, portant la clé de son incarnation et ses propres valeurs (voir plus haut).
     */
    static LIES = [...Incarnations.VECUS, ...Incarnations.FOCUS, ...Incarnations.CAPACITES, ...Incarnations.VOIES,
        ...Incarnations.EQUIPEMENTS, ...Incarnations.STOCKS, ...Incarnations.POSSESSIONS, ...Incarnations.METAMORPHES];

    /**
     * Les types qui ont des valeurs propres à l'acteur (statut, focus, pacte...) et dont le
     * dépôt, déjà connus d'une autre incarnation, suit ses propres règles (voir
     * AbstractFeature.deposerParEpoque) : les focus et les capacités.
     */
    static PAR_EPOQUE = [...Incarnations.FOCUS, ...Incarnations.CAPACITES];

    /**
     * Les types d'acteur qui vivent des incarnations.
     */
    static ACTEURS = ['figure', 'fraternite'];

    /**
     * Les Ka de la figure, portés par chaque incarnation (voir kas) : le pentacle, le Soleil, et
     * ceux du Selenim.
     */
    static KA = ['air', 'eau', 'feu', 'lune', 'terre', 'soleil', 'noyau', 'brume', 'orichalque',
        'pavane', 'reserve', 'reserveCourante'];

    /**
     * Les bonus de la figure, portés par chaque incarnation (voir bonus).
     */
    static BONUS = ['mouvement', 'initiative', 'dommage', 'protection'];

    /**
     * Les compteurs de sapience : ils se transmettent, et une modification à une époque se
     * reporte sur toutes les incarnations postérieures (voir ecrireCompteurs).
     */
    static SAPIENCES = ['sapience', 'sapienceDepensee'];

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
     * @returns the embedded vecus of the incarnation, in actor order.
     */
    vecusDe(cle) {
        return this.rattaches(cle, ['vecu']);
    }

    /**
     * @param vecu An embedded vecu.
     * @returns the incarnation to which the vecu belongs, null if none.
     */
    incarnationDe(vecu) {
        return this.incarnation(this.epoqueDe(vecu));
    }

    /**
     * @param cle The key of the incarnation.
     * @returns {string} son nom pour l'utilisateur : la période, suivie de ses vécus, comme
     *          l'onglet incarnations l'affiche (ex: « Les Arthuriades — Chevalier Errant »).
     */
    nomDe(cle) {
        const incarnation = this.incarnation(cle);
        if (incarnation == null) return "";
        const periode = game.items.find(i => i.type === 'periode' && i.sid === Version.data(incarnation).periode);
        const vecus = this.vecusDe(cle).map(v => v.name).join(", ");
        return (periode?.name ?? incarnation.name) + (vecus ? " — " + vecus : "");
    }

    /**
     * @returns all the incarnations, in no particular order.
     */
    toutes() {
        return this.actor.items.filter(i => i.type === 'incarnation');
    }

    /**
     * La chronologie se lit en partant de la tête — l'incarnation sans prédécesseur, ou dont le
     * prédécesseur a disparu — et en suivant les successeurs. Une chaîne abîmée reste lisible :
     * les incarnations qu'on n'atteint pas sont rangées en queue, dans l'ordre de l'acteur, et
     * une boucle ne fait pas tourner la lecture sans fin.
     * @returns the incarnations in chain order: from the oldest to the most recent.
     */
    #chaine() {
        const toutes = this.toutes();
        const parCle = new Map(toutes.map(i => [i.sid, i]));
        const chaine = [];
        const vus = new Set();
        let courante = toutes.find(i => {
            const predecesseur = Version.data(i).predecesseur;
            return predecesseur == null || !parCle.has(predecesseur);
        });
        while (courante != null && !vus.has(courante.sid)) {
            chaine.push(courante);
            vus.add(courante.sid);
            const successeur = Version.data(courante).successeur;
            courante = successeur == null ? null : parCle.get(successeur);
        }
        for (const incarnation of toutes) {
            if (!vus.has(incarnation.sid)) chaine.push(incarnation);
        }
        return chaine;
    }

    /**
     * Réécrit les liens pour que la chaîne suive l'ordre donné : seules les incarnations dont
     * un lien change sont écrites, en une seule requête.
     * @param ordre The incarnations, from the oldest to the most recent.
     */
    async #chainer(ordre) {
        const updates = [];
        ordre.forEach((incarnation, i) => {
            const predecesseur = ordre[i - 1]?.sid ?? null;
            const successeur = ordre[i + 1]?.sid ?? null;
            const data = Version.data(incarnation);
            if ((data.predecesseur ?? null) !== predecesseur || (data.successeur ?? null) !== successeur) {
                updates.push({
                    _id: incarnation.id,
                    [Version.path(incarnation, 'predecesseur')]: predecesseur,
                    [Version.path(incarnation, 'successeur')]: successeur
                });
            }
        });
        if (updates.length > 0) {
            await this.actor.updateEmbeddedDocuments('Item', updates);
        }
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

    // ------------------------------------------------------------------ les exemplaires liés

    /**
     * @param sid The system identifier of an item.
     * @returns the embedded items with this sid: one per incarnation which knows it, for the
     *          types linked to incarnations (see LIES).
     */
    exemplaires(sid) {
        return this.actor.items.filter(i => i.sid === sid && i.type !== 'incarnation');
    }

    /**
     * @param item An embedded item of a type linked to incarnations.
     * @returns {string|null} la clé de l'incarnation de cet exemplaire, null s'il n'en a pas.
     */
    epoqueDe(item) {
        if (!Incarnations.LIES.includes(item?.type)) return null;
        return item.system?.incarnation ?? null;
    }

    /**
     * @param sid The system identifier of an item.
     * @param cle The key of an incarnation.
     * @returns l'exemplaire de cette incarnation, null si elle n'en a pas.
     */
    exemplaireDans(sid, cle) {
        if (cle == null) return null;
        return this.exemplaires(sid).find(i => this.epoqueDe(i) === cle) ?? null;
    }

    /**
     * @param sid The system identifier of an item.
     * @returns the incarnations which have an exemplar of the item, in chain order, from the
     *          oldest.
     */
    #porteuses(sid) {
        const cles = new Set(this.exemplaires(sid).map(i => this.epoqueDe(i)));
        return this.#chaine().filter(i => cles.has(i.sid));
    }

    /**
     * @param item An embedded item.
     * @returns {string|null} la clé de l'incarnation de cet exemplaire.
     */
    rattachement(item) {
        return this.epoqueDe(item);
    }

    /**
     * @param item An embedded item.
     * @returns true if the incarnation of this exemplar counts for the actor.
     */
    estActif(item) {
        return this.estActive(this.epoqueDe(item));
    }

    /**
     * L'exemplaire qui fait foi pour l'acteur : celui de l'incarnation courante, sinon celui de
     * l'incarnation antérieure la plus proche. Les incarnations désactivées ne comptent pas,
     * les postérieures jamais. Pour un acteur sans incarnations, son unique exemplaire.
     * @param sid The system identifier of an item.
     * @returns the effective embedded item, null if the actor does not know it now.
     */
    exemplaireEffectif(sid) {
        const copies = this.exemplaires(sid);
        if (copies.length === 0) return null;
        if (!this.porte) return copies[0];
        const comptent = this.ordonnees({ actif: true, jusqua: this.courante })
            .filter(i => Version.data(i).actif === true)
            .reverse();
        for (const incarnation of comptent) {
            const copie = copies.find(i => this.epoqueDe(i) === incarnation.sid);
            if (copie != null) return copie;
        }
        return null;
    }

    /**
     * L'incarnation voisine la plus proche, dans un sens, qui connaît un item. Les incarnations
     * désactivées sont ignorées.
     * @param sid  The system identifier of an item.
     * @param cle  The key of the incarnation from which to look.
     * @param sens 'anterieure' (vers les plus anciennes) ou 'posterieure'.
     * @returns {{ incarnation, item }|null} l'incarnation et son exemplaire, null si aucune.
     */
    voisine(sid, cle, sens) {
        const chaine = this.#chaine();
        const index = chaine.findIndex(i => i.sid === cle);
        if (index === -1) return null;
        const cote = sens === 'anterieure' ? chaine.slice(0, index).reverse() : chaine.slice(index + 1);
        for (const incarnation of cote) {
            if (Version.data(incarnation).actif !== true) continue;
            const item = this.exemplaireDans(sid, incarnation.sid);
            if (item != null) return { incarnation, item };
        }
        return null;
    }

    /**
     * @param sid The system identifier of an item.
     * @param cle The key of an incarnation.
     * @returns true if the incarnation has an exemplar of the item.
     */
    aRattache(sid, cle) {
        return this.exemplaireDans(sid, cle) != null;
    }

    /**
     * @param cle   The key of an incarnation.
     * @param types The item types to keep, all if omitted.
     * @returns the exemplars of the incarnation — its vecus, and what it acquired —, in actor
     *          order.
     */
    rattaches(cle, types = null) {
        if (cle == null) return [];
        return this.actor.items.filter(i => this.epoqueDe(i) === cle && (types == null || types.includes(i.type)));
    }

    // ------------------------------------------------------------------ les voies

    /**
     * La voie que l'acteur suit — ou son métamorphe : celle de l'incarnation courante, sinon celle
     * de l'incarnation antérieure la plus proche qui en a une. Les incarnations désactivées ne
     * comptent pas, les postérieures jamais. Une incarnation a au plus une voie de chaque type.
     * @param type 'magie', 'alchimie' ou 'metamorphe'.
     * @returns the embedded voie, null if none.
     */
    voie(type) {
        const voies = this.actor.items.filter(i => i.type === type);
        if (!this.porte) return voies[0] ?? null;
        const comptent = this.ordonnees({ actif: true, jusqua: this.courante })
            .filter(i => Version.data(i).actif === true)
            .reverse();
        for (const incarnation of comptent) {
            const voie = voies.find(i => this.epoqueDe(i) === incarnation.sid);
            if (voie != null) return voie;
        }
        return null;
    }

    /**
     * Change la voie de l'incarnation courante :
     *   - c'est déjà la voie suivie (de l'incarnation courante ou d'une antérieure) : rien ;
     *   - sinon l'incarnation courante reçoit son exemplaire de cette voie, qui remplace celui
     *     qu'elle avait ; les voies des autres incarnations ne changent pas.
     * Un acteur sans incarnations n'a qu'une voie de chaque type, remplacée. Vaut aussi pour le
     * métamorphe.
     * @param sid     The system identifier of the world voie.
     * @param type    'magie', 'alchimie' ou 'metamorphe'.
     * @param valeurs Les valeurs propres à l'acteur du nouvel exemplaire.
     * @param sans    Les champs de l'item du monde que l'exemplaire ne recopie pas.
     */
    async changerVoie(sid, type, { valeurs = {}, sans = ['description'] } = {}) {
        if (this.voie(type)?.sid === sid) return;
        const cle = this.courante;
        if (this.porte && cle == null) return;
        const remplacees = this.porte ? this.rattaches(cle, [type]) : this.actor.items.filter(i => i.type === type);
        const voie = new EmbeddedItem(this.actor, sid)
            .withContext("Change of voie " + type)
            .withoutData(...sans)
            .withDeleteAfter(remplacees);
        for (const [champ, valeur] of Object.entries(valeurs)) voie.withData(champ, valeur);
        if (this.porte) voie.withIncarnation(cle);
        await voie.create();
    }

    // ------------------------------------------------------------------ les équipements

    /**
     * Les armes ou les armures de l'acteur : celles de l'incarnation courante seulement — elles
     * ne se transmettent pas d'une incarnation à l'autre. Un acteur sans incarnations (un
     * figurant) a toutes les siennes. Plusieurs exemplaires d'une même arme sont possibles.
     * @param type 'arme' ou 'armure'.
     * @returns the embedded items.
     */
    equipements(type) {
        const tous = this.actor.items.filter(i => i.type === type);
        if (!this.porte) return tous;
        const cle = this.courante;
        return cle == null ? [] : tous.filter(i => this.epoqueDe(i) === cle);
    }

    /**
     * Prépare les données d'une arme ou d'une armure déposée sur l'acteur : elle appartient à
     * l'incarnation courante, dont elle reçoit la clé.
     * @param data The data of the item to create, modified in place.
     * @returns false if the item cannot be created: the actor has no current incarnation.
     */
    lierEquipement(data) {
        if (!this.porte || !Incarnations.EQUIPEMENTS.includes(data?.type)) return true;
        if (this.courante == null) return false;
        foundry.utils.setProperty(data, 'system.incarnation', this.courante);
        return true;
    }

    // ------------------------------------------------------------------ les stocks

    /**
     * @param sid The system identifier of a stocked item (materiae).
     * @returns le stock : la somme des variations de ses exemplaires dont l'incarnation compte
     *          (la courante et les antérieures actives). Pour un acteur sans incarnations, la
     *          quantité de son unique exemplaire.
     */
    stock(sid) {
        const quantite = item => Version.data(item)?.quantite ?? 0;
        if (!this.porte) return quantite(this.exemplaires(sid)[0]);
        return this.exemplaires(sid)
            .filter(i => this.estActive(this.epoqueDe(i)))
            .reduce((total, i) => total + quantite(i), 0);
    }

    /**
     * Les stocks à afficher : ceux dont le stock est positif, et ceux que l'incarnation
     * courante a déposés ou modifiés (son propre exemplaire), même à 0 ou moins.
     * @param type The stocked type ('materiae').
     * @returns { sid, stock, propre } for each, propre being the exemplar of the current
     *          incarnation, null if none.
     */
    stocks(type) {
        const sids = [...new Set(this.actor.items.filter(i => i.type === type).map(i => i.sid))];
        return sids
            .map(sid => ({
                sid: sid,
                stock: this.stock(sid),
                propre: this.porte ? this.exemplaireDans(sid, this.courante) : this.exemplaires(sid)[0]
            }))
            .filter(s => s.stock > 0 || s.propre != null);
    }

    /**
     * Fixe le stock d'un item à l'époque courante : l'exemplaire de l'incarnation courante
     * reçoit la variation qui mène à ce total, et est créé s'il n'existe pas (copié d'un autre
     * exemplaire). Les époques antérieures ne changent pas.
     * @param sid   The system identifier of the stocked item.
     * @param total The new stock.
     */
    async fixerStock(sid, total) {
        const quantite = isNaN(total) ? 0 : total;
        if (!this.porte) {
            const item = this.exemplaires(sid)[0];
            if (item != null) await item.update({ [Version.path(item, 'quantite')]: quantite });
            return;
        }
        const cle = this.courante;
        if (cle == null) return;
        const propre = this.exemplaireDans(sid, cle);
        const anterieur = this.stock(sid) - (Version.data(propre)?.quantite ?? 0);
        const variation = quantite - anterieur;
        if (propre != null) {
            await propre.update({ [Version.path(propre, 'quantite')]: variation });
        } else {
            const source = this.exemplaires(sid)[0];
            if (source != null) await this.creerExemplaire(source, cle, { quantite: variation });
        }
    }

    // ------------------------------------------------------------------ les possessions

    /**
     * @param item An exemplar of a possession.
     * @returns true if the exemplar marks the possession at its incarnation.
     */
    static #possede(item) {
        return item != null && Version.data(item).possede !== false;
    }

    /**
     * Les possessions de l'acteur : celles dont l'exemplaire qui fait foi (incarnation courante,
     * sinon antérieure active la plus proche) marque la possession. Un acteur sans incarnations
     * a toutes les siennes.
     * @param type The possession type ('catalyseur').
     * @returns the effective embedded items.
     */
    possessions(type) {
        const sids = [...new Set(this.actor.items.filter(i => i.type === type).map(i => i.sid))];
        return sids.map(sid => this.exemplaireEffectif(sid)).filter(i => Incarnations.#possede(i));
    }

    /**
     * L'acteur acquiert une possession à l'époque courante : déjà possédée, rien ; sinon
     * l'incarnation courante reçoit son exemplaire, ou le sien est marqué possédé.
     * @param sid     The system identifier of the world item.
     * @param valeurs Les valeurs propres à l'acteur d'un nouvel exemplaire (ex: { active: false }).
     * @param sans    Les champs de l'item du monde que l'exemplaire ne recopie pas.
     */
    async acquerir(sid, { valeurs = {}, sans = ['description'] } = {}) {
        const exemplaire = () => {
            const item = new EmbeddedItem(this.actor, sid).withContext("Possession").withoutData(...sans);
            for (const [champ, valeur] of Object.entries(valeurs)) item.withData(champ, valeur);
            return item;
        };
        if (!this.porte) {
            if (this.exemplaires(sid).length > 0) return;
            await exemplaire().create();
            return;
        }
        const cle = this.courante;
        if (cle == null || Incarnations.#possede(this.exemplaireEffectif(sid))) return;
        const propre = this.exemplaireDans(sid, cle);
        if (propre != null) {
            await propre.update({ [Version.path(propre, 'possede')]: true });
            return;
        }
        await exemplaire().withIncarnation(cle).withData("possede", true).create();
    }

    /**
     * L'acteur perd une possession à l'époque courante ; les époques antérieures la gardent.
     * Si l'incarnation courante l'avait acquise sans qu'une antérieure la lui transmette, son
     * exemplaire est supprimé ; sinon l'incarnation courante reçoit, ou passe, un exemplaire
     * marqué non possédé, qui la retire à partir de cette époque.
     * @param sid The system identifier of the possession.
     */
    async perdre(sid) {
        if (!this.porte) {
            const ids = this.exemplaires(sid).map(i => i.id);
            if (ids.length > 0) await this.actor.deleteEmbeddedDocuments('Item', ids);
            return;
        }
        const cle = this.courante;
        if (cle == null) return;
        const propre = this.exemplaireDans(sid, cle);
        const transmise = Incarnations.#possede(this.voisine(sid, cle, 'anterieure')?.item);
        if (propre != null && !transmise) {
            await this.actor.deleteEmbeddedDocuments('Item', [propre.id]);
        } else if (propre != null) {
            await propre.update({ [Version.path(propre, 'possede')]: false });
        } else {
            const source = this.exemplaireEffectif(sid);
            if (source != null) await this.creerExemplaire(source, cle, { possede: false });
        }
    }

    // ------------------------------------------------------------------ les valeurs par époque

    /**
     * Les Ka et les bonus de la figure sont des valeurs portées par chaque incarnation,
     * indépendantes d'une époque à l'autre : la fiche lit et écrit celles de l'incarnation
     * courante ; une nouvelle incarnation reprend celles de l'antérieure active la plus proche
     * (voir heritage).
     * @param valeurs Le bloc de valeurs ('ka', 'bonus') d'une incarnation, null pour aucun.
     * @param cles    Ses valeurs, par nom.
     * @returns les valeurs du bloc, 0 pour celles qu'il n'a pas.
     */
    static #valeursDe(valeurs, cles) {
        return Object.fromEntries(cles.map(k => [k, valeurs?.[k] ?? 0]));
    }

    /**
     * @param valeur Une valeur saisie.
     * @returns la valeur en nombre, 0 si elle n'en est pas un.
     */
    static #nombre(valeur) {
        const n = Number(valeur);
        return isNaN(n) ? 0 : n;
    }

    /**
     * @returns les données de l'incarnation courante, vides s'il n'y en a pas.
     */
    #donnees() {
        return Version.data(this.incarnation(this.courante));
    }

    /**
     * Écrit des valeurs dans l'incarnation courante ; les noms inconnus sont ignorés.
     * @param champ   Le bloc de valeurs ('ka', 'bonus').
     * @param cles    Ses valeurs, par nom.
     * @param valeurs Les valeurs à écrire, par nom (ex: { air: 3 }).
     * @returns false if the actor has no current incarnation.
     */
    async #ecrireValeurs(champ, cles, valeurs) {
        const nombres = {};
        for (const [k, v] of Object.entries(valeurs)) {
            if (cles.includes(k)) nombres[k] = Incarnations.#nombre(v);
        }
        return this.#ecrireBloc(champ, nombres);
    }

    /**
     * Les Ka de la figure : ceux de l'incarnation courante ; tous à 0 sans incarnation courante.
     * @returns { air, eau, feu, lune, terre, soleil, noyau, brume, orichalque, pavane, reserve,
     *          reserveCourante }.
     */
    kas() {
        return Incarnations.#valeursDe(this.#donnees().ka, Incarnations.KA);
    }

    /**
     * @param valeurs Les Ka à écrire dans l'incarnation courante, par nom (ex: { air: 3 }).
     * @returns false if the actor has no current incarnation.
     */
    async ecrireKa(valeurs) {
        return this.#ecrireValeurs('ka', Incarnations.KA, valeurs);
    }

    /**
     * Les bonus de la figure : ceux de l'incarnation courante ; tous à 0 sans incarnation
     * courante.
     * @returns { mouvement, initiative, dommage, protection }.
     */
    bonus() {
        return Incarnations.#valeursDe(this.#donnees().bonus, Incarnations.BONUS);
    }

    /**
     * @param valeurs Les bonus à écrire dans l'incarnation courante, par nom.
     * @returns false if the actor has no current incarnation.
     */
    async ecrireBonus(valeurs) {
        return this.#ecrireValeurs('bonus', Incarnations.BONUS, valeurs);
    }

    // ------------------------------------------------------------------ le laboratoire, l'akasha

    /**
     * Le laboratoire (`alchimie`) et les voyages akashiques (`akasha`) sont des blocs portés par
     * chaque incarnation : une nouvelle incarnation reçoit une copie de ceux de l'antérieure
     * active la plus proche (voir heritage) ; chaque époque garde ensuite les siens.
     * @param bloc  Le bloc d'une incarnation, null pour aucun.
     * @param champ 'alchimie' ou 'akasha'.
     * @returns une copie du bloc ; le bloc vide du schéma s'il n'y en a pas.
     */
    static #blocDe(bloc, champ) {
        if (bloc != null) return foundry.utils.deepClone(bloc);
        return foundry.utils.deepClone(new IncarnationDataModel({ id: 'vide' })._source.versions.v5[champ]);
    }

    /**
     * Écrit dans un bloc de l'incarnation courante.
     * @param champ   'alchimie' ou 'akasha'.
     * @param valeurs Les valeurs, par chemin dans le bloc.
     * @returns false if the actor has no current incarnation.
     */
    async #ecrireBloc(champ, valeurs) {
        const incarnation = this.incarnation(this.courante);
        if (incarnation == null) return false;
        const update = {};
        for (const [chemin, valeur] of Object.entries(valeurs)) {
            update[Version.path(incarnation, champ) + '.' + chemin] = valeur;
        }
        if (Object.keys(update).length > 0) await incarnation.update(update);
        return true;
    }

    /**
     * Le laboratoire de la figure : celui de l'incarnation courante, indépendant de ceux des
     * autres époques ; le laboratoire vide sans incarnation courante.
     * @returns { constructs, primae, laboratoires, courant }.
     */
    alchimie() {
        return Incarnations.#blocDe(this.#donnees().alchimie, 'alchimie');
    }

    /**
     * @param valeurs Les valeurs, par chemin dans le laboratoire (ex: { 'primae.air.quantite': 3,
     *                'constructs.cornue.active': true, courant: null }).
     * @returns false if the actor has no current incarnation.
     */
    async ecrireAlchimie(valeurs) {
        return this.#ecrireBloc('alchimie', valeurs);
    }

    /**
     * Les voyages akashiques de la figure : ceux de l'incarnation courante, indépendants de ceux
     * des autres époques ; vides sans incarnation courante.
     * @returns { nef, barge, boussole, compas }.
     */
    akasha() {
        return Incarnations.#blocDe(this.#donnees().akasha, 'akasha');
    }

    /**
     * @param valeurs Les valeurs, par chemin dans les voyages akashiques (ex:
     *                { 'nef.active': true, 'boussole.zenith': 2 }).
     * @returns false if the actor has no current incarnation.
     */
    async ecrireAkasha(valeurs) {
        return this.#ecrireBloc('akasha', valeurs);
    }

    // ------------------------------------------------------------------ la sapience

    /**
     * Les compteurs de la figure : ceux de l'incarnation courante ; tous à 0 sans incarnation
     * courante.
     * @returns { sapience, sapienceDepensee, pointsIncarnations }.
     */
    compteurs() {
        const data = Version.data(this.incarnation(this.courante));
        return {
            sapience: data?.sapience ?? 0,
            sapienceDepensee: data?.sapienceDepensee ?? 0,
            pointsIncarnations: data?.pointsIncarnations ?? 0
        };
    }

    /**
     * Écrit les compteurs saisis à l'époque courante. La sapience et la sapience dépensée se
     * transmettent : ajouter ou retirer N à l'époque courante ajoute ou retire aussi N à toutes
     * les incarnations postérieures, désactivées comprises. Les points d'incarnation ne valent
     * que pour l'époque courante.
     * @param valeurs Les compteurs saisis, par nom.
     * @returns false if the actor has no current incarnation.
     */
    async ecrireCompteurs(valeurs) {
        const cle = this.courante;
        const courante = this.incarnation(cle);
        if (courante == null) return false;
        const chaine = this.#chaine();
        const posterieures = chaine.slice(chaine.findIndex(i => i.sid === cle) + 1);
        const updates = new Map();
        const ecrire = (incarnation, champ, valeur) => {
            const update = updates.get(incarnation.id) ?? { _id: incarnation.id };
            update[Version.path(incarnation, champ)] = valeur;
            updates.set(incarnation.id, update);
        };
        for (const champ of Incarnations.SAPIENCES) {
            if (!(champ in valeurs)) continue;
            const ecart = Incarnations.#nombre(valeurs[champ]) - (Version.data(courante)[champ] ?? 0);
            if (ecart === 0) continue;
            for (const incarnation of [courante, ...posterieures]) {
                ecrire(incarnation, champ, (Version.data(incarnation)[champ] ?? 0) + ecart);
            }
        }
        if ('pointsIncarnations' in valeurs) {
            ecrire(courante, 'pointsIncarnations', Incarnations.#nombre(valeurs.pointsIncarnations));
        }
        if (updates.size > 0) await this.actor.updateEmbeddedDocuments('Item', [...updates.values()]);
        return true;
    }

    // ------------------------------------------------------------------ la stase

    /**
     * @param stase La stase d'une incarnation, null pour aucune.
     * @returns une copie de la stase, null s'il n'y en a pas.
     */
    static #staseDe(stase) {
        return stase == null ? null : { description: stase.description ?? "", ka: stase.ka ?? 0 };
    }

    /**
     * La stase de la figure : celle de l'incarnation courante, au plus une par époque ; null si
     * l'incarnation courante n'en a pas, ou s'il n'y a pas d'incarnation courante.
     * @returns { description, ka } or null.
     */
    stase() {
        return Incarnations.#staseDe(this.#donnees().stase);
    }

    /**
     * Écrit la stase de l'incarnation courante : saisir une valeur la crée ; une stase dont la
     * description est vide et le Ka à 0 est retirée.
     * @param valeurs Les valeurs saisies (description, ka).
     * @returns false if the actor has no current incarnation.
     */
    async ecrireStase(valeurs) {
        const incarnation = this.incarnation(this.courante);
        if (incarnation == null) return false;
        const stase = { description: "", ka: 0, ...(Incarnations.#staseDe(Version.data(incarnation).stase) ?? {}) };
        if ('description' in valeurs) stase.description = String(valeurs.description ?? "").trim();
        if ('ka' in valeurs) stase.ka = Incarnations.#nombre(valeurs.ka);
        const vide = stase.description === "" && stase.ka === 0;
        await incarnation.update({ [Version.path(incarnation, 'stase')]: vide ? null : stase });
        return true;
    }

    // ------------------------------------------------------------------ le simulacre

    /**
     * Le simulacre de l'acteur : celui de l'incarnation courante. Il ne se transmet pas : une
     * incarnation qui n'en a pas n'a pas de simulacre. C'est un acteur, non un item : le lien est
     * porté par l'incarnation (`simulacre`), pas par une clé sur l'acteur lié, qui pourrait
     * servir de simulacre à plusieurs figures.
     * @returns the simulacre actor, null if none.
     */
    simulacre() {
        const sid = Version.data(this.incarnation(this.courante))?.simulacre ?? null;
        return sid == null ? null : (game.actors.find(a => a.sid === sid) ?? null);
    }

    /**
     * Fait d'un acteur le simulacre de l'incarnation courante, à la place de celui qu'elle avait.
     * @param sid The system identifier of the actor.
     * @returns false if the actor has no current incarnation.
     */
    async definirSimulacre(sid) {
        const incarnation = this.incarnation(this.courante);
        if (incarnation == null) return false;
        await incarnation.update({ [Version.path(incarnation, 'simulacre')]: sid });
        return true;
    }

    /**
     * Retire le simulacre de l'incarnation courante ; les autres incarnations gardent le leur, et
     * l'acteur simulacre reste dans le monde.
     * @returns false if the actor has no current incarnation.
     */
    async retirerSimulacre() {
        return this.definirSimulacre(null);
    }

    /**
     * Retire des acteurs, supprimés du monde, des incarnations qui les avaient pour simulacre.
     * @param sids The system identifiers of the deleted actors.
     */
    async oublierSimulacres(sids) {
        const updates = this.toutes()
            .filter(i => sids.includes(Version.data(i).simulacre))
            .map(i => ({ _id: i.id, [Version.path(i, 'simulacre')]: null }));
        if (updates.length > 0) {
            await this.actor.updateEmbeddedDocuments('Item', updates);
        }
    }

    // ------------------------------------------------------------------ les degrés

    /**
     * Ce qu'un item doit à chaque incarnation, active ou non.
     * @param sid The system identifier of an item.
     * @returns the exemplars, as { item, periode, degre }, periode being the key of the
     *          incarnation, in chain order.
     */
    apports(sid) {
        return this.#porteuses(sid).map(i => ({
            item: this.exemplaireDans(sid, i.sid),
            periode: i.sid,
            degre: this.degreDans(sid, i.sid)
        }));
    }

    /**
     * @param sid The system identifier of an item.
     * @param cle The key of an incarnation.
     * @returns the degre acquired by the item during the incarnation — that of its exemplar —,
     *          0 if none.
     */
    degreDans(sid, cle) {
        return Version.data(this.exemplaireDans(sid, cle))?.degre ?? 0;
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
     * Le degré d'un item tel que l'acteur l'a acquis, toutes incarnations confondues. Pour un
     * acteur sans incarnations, le degré porté par l'item lui-même.
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
     * vécu est embarqué avec elle. Elle arrive en queue de la chaîne — la plus récente —, et
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
     * formulaire d'incarnation : le vécu est embarqué dans l'incarnation, avec le
     * degré donné. Elle arrive en queue de la chaîne, et devient la courante si c'est la première.
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
        const cle = await this.#creer(periode);
        await this.#embarquerVecu(monde, cle, degre);
        return { cle: cle, refus: null };
    }

    /**
     * Crée une incarnation sans vécu, à partir de sa seule période. Elle arrive en queue de la
     * chaîne, et devient la courante si c'est la première.
     * @param periode The system identifier of the world periode.
     * @returns {string|null} la clé de l'incarnation créée.
     */
    async ajouter(periode) {
        if (game.items.find(i => i.type === 'periode' && i.sid === periode) == null) return null;
        return await this.#creer(periode);
    }

    /**
     * Ajoute un vécu à une incarnation : il en vit la période. Un vécu ne se
     * vit qu'une fois : déjà embarqué, il est refusé.
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
        await this.#embarquerVecu(monde, cle, degre);
        return null;
    }

    /**
     * Retire un vécu d'une incarnation, et de la figure. L'incarnation peut rester sans vécu.
     * @param cle The key of the incarnation.
     * @param sid The system identifier of the vecu.
     */
    async retirerVecu(cle, sid) {
        const vecu = this.exemplaireDans(sid, cle);
        if (vecu?.type === 'vecu') {
            await this.actor.deleteVecu(vecu);
        }
    }

    /**
     * Change la période d'une incarnation : ses vécus, qui ne la recopient pas, en changent du
     * même coup.
     * @param cle     The key of the incarnation.
     * @param periode The system identifier of the world periode.
     */
    async changerPeriode(cle, periode) {
        const incarnation = this.incarnation(cle);
        const monde = game.items.find(i => i.type === 'periode' && i.sid === periode);
        if (incarnation == null || monde == null) return;
        await incarnation.update({ name: monde.name, img: monde.img, [Version.path(incarnation, 'periode')]: periode });
    }

    /**
     * Retire une incarnation, et tous ses exemplaires : ses vécus, ce qu'elle a acquis. Les
     * autres incarnations gardent les leurs.
     * @param cle The key of the incarnation.
     */
    async retirer(cle) {

        const incarnation = this.incarnation(cle);
        if (incarnation == null) return;

        // Remove the current incarnation if necessary
        if (this.courante === cle) {
            await this.definirCourante(null);
        }

        // Its exemplars go with it
        const siens = this.rattaches(cle);

        // Mend the chain around it, then delete it
        await this.#chainer(this.#chaine().filter(i => i.sid !== cle));
        await this.actor.deleteEmbeddedDocuments('Item', [incarnation.id]);

        // Delete the vecus, with their dependencies
        for (const vecu of siens.filter(i => i.type === 'vecu')) {
            await this.actor.deleteVecu(vecu);
        }

        // Delete the other items
        const ids = siens.filter(i => i.type !== 'vecu').map(i => i.id);
        if (ids.length > 0) {
            await this.actor.deleteEmbeddedDocuments('Item', ids);
        }
    }

    /**
     * Ce qu'une nouvelle incarnation reçoit de celle dont elle hérite : ses Ka et ses bonus (0
     * pour ceux qu'elle n'a pas), sa sapience et sa sapience dépensée, une copie de son
     * laboratoire et de ses voyages akashiques (vides du schéma si elle n'en a pas), sa stase
     * (aucune si elle n'en a pas). Les points d'incarnation partent de 0, sauf à les reprendre.
     * Sert à la création (#creer, depuis l'antérieure active la plus proche) et à la migration
     * 1.0.10 (depuis ce que portait la figure).
     * @param donnees            Les données dont hériter : celles d'une incarnation ou le relevé
     *                           de la figure ; {} pour aucune.
     * @param pointsIncarnations true pour reprendre aussi les points d'incarnation.
     * @returns { ka, bonus, alchimie, akasha, sapience, sapienceDepensee, pointsIncarnations,
     *          stase }.
     */
    static heritage(donnees, { pointsIncarnations = false } = {}) {
        return {
            ka: Incarnations.#valeursDe(donnees?.ka, Incarnations.KA),
            bonus: Incarnations.#valeursDe(donnees?.bonus, Incarnations.BONUS),
            alchimie: Incarnations.#blocDe(donnees?.alchimie, 'alchimie'),
            akasha: Incarnations.#blocDe(donnees?.akasha, 'akasha'),
            sapience: donnees?.sapience ?? 0,
            sapienceDepensee: donnees?.sapienceDepensee ?? 0,
            pointsIncarnations: pointsIncarnations ? donnees?.pointsIncarnations ?? 0 : 0,
            stase: Incarnations.#staseDe(donnees?.stase)
        };
    }

    /**
     * Crée une incarnation EN QUEUE de la chronologie : elle devient la plus récente. Elle
     * hérite de l'incarnation antérieure active la plus proche (voir heritage).
     * @param periode The system identifier of the world periode.
     * @returns {string} la clé de l'incarnation créée.
     */
    async #creer(periode) {
        const monde = game.items.find(i => i.type === 'periode' && i.sid === periode);
        const chaine = this.#chaine();
        const derniere = chaine.at(-1) ?? null;
        const anterieure = [...chaine].reverse().find(i => Version.data(i).actif === true) ?? null;
        // Sans system.id, l'item reçoit un identifiant neuf à sa création (NephilimItem._preCreate).
        const [cree] = await this.actor.createEmbeddedDocuments('Item', [{
            name: monde?.name ?? periode,
            type: 'incarnation',
            img: monde?.img,
            system: {
                versions: {
                    v5: {
                        periode: periode,
                        actif: true,
                        predecesseur: derniere?.sid ?? null,
                        successeur: null,
                        ...Incarnations.heritage(Version.data(anterieure))
                    }
                }
            }
        }]);
        if (derniere == null) {
            await this.definirCourante(cree.sid);
        } else {
            await derniere.update({ [Version.path(derniere, 'successeur')]: cree.sid });
        }
        return cree.sid;
    }

    /**
     * Embarque un vécu du monde dans une incarnation. Sa période n'est pas recopiée : c'est
     * celle de l'incarnation, que porte la clé (la période du vécu du monde ne sert qu'à
     * créer une incarnation depuis lui, voir creerDepuisVecu).
     * @param monde The world vecu.
     * @param cle   The key of the incarnation.
     * @param degre The degre of the vecu.
     */
    async #embarquerVecu(monde, cle, degre = 0) {
        await new EmbeddedItem(this.actor, monde.sid)
            .withContext("Drop of a vecu on incarnation " + cle)
            .withIncarnation(cle, degre)
            .withData("mnemos", [])
            .withData("element", Version.data(monde).element)
            .withoutData('description', 'periode')
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

        // Move the incarnation just after its new parent, then link the chain again
        const ordre = chaine.filter(i => i.sid !== cle);
        ordre.splice(ordre.findIndex(i => i.sid === parent) + 1, 0, moved);
        await this.#chainer(ordre);
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
     * Crée l'exemplaire d'une incarnation à partir d'un autre exemplaire du même item : il en
     * reprend les valeurs, modulo les changements donnés.
     * @param source       The embedded item to copy.
     * @param cle          The key of the incarnation of the new item.
     * @param changements  Les valeurs à changer, par champ de la version (ex: { status: 'connu' }).
     * @returns the new embedded item.
     */
    async creerExemplaire(source, cle, changements = {}) {
        const data = source.toObject();
        delete data._id;
        // La clé est commune à toutes les versions : à la racine
        foundry.utils.setProperty(data, 'system.incarnation', cle);
        for (const [champ, valeur] of Object.entries(changements)) {
            foundry.utils.setProperty(data, Version.path(source, champ), valeur);
        }
        const [cree] = await this.actor.createEmbeddedDocuments('Item', [data]);
        return cree;
    }

    /**
     * Écrit des valeurs propres à l'acteur (statut, focus, pacte, quantité...) sur un item lié.
     * Elles valent pour l'incarnation courante : si l'exemplaire est le sien, il est modifié ;
     * sinon — c'est celui d'une incarnation antérieure —, l'incarnation courante reçoit son
     * propre exemplaire, copié de celui-ci avec les nouvelles valeurs. Les autres items, et un
     * acteur sans incarnation courante, sont simplement modifiés.
     * @param item         The embedded item to write.
     * @param changements  Les valeurs, par champ de la version (ex: { pacte: true }).
     * @returns the embedded item which carries the new values.
     */
    async ecrire(item, changements) {
        const courante = this.courante;
        if (!this.porte || courante == null || !Incarnations.LIES.includes(item?.type)) {
            await item.update(Incarnations.#chemins(item, changements));
            return item;
        }
        const cible = this.epoqueDe(item) === courante ? item : this.exemplaireDans(item.sid, courante);
        if (cible != null) {
            await cible.update(Incarnations.#chemins(cible, changements));
            return cible;
        }
        return await this.creerExemplaire(item, courante, changements);
    }

    /**
     * @param item        The item to write.
     * @param changements Les valeurs, par champ de la version.
     * @returns the update data, at the paths of the item's version.
     */
    static #chemins(item, changements) {
        return Object.fromEntries(Object.entries(changements).map(([champ, valeur]) => [Version.path(item, champ), valeur]));
    }

    /**
     * Retire un item d'une incarnation : son exemplaire y est supprimé, les autres incarnations
     * gardent le leur. Un vécu part avec ses dépendances (voir NephilimActor.deleteVecu).
     * @param item The embedded item to remove, or another exemplar of the same item.
     * @param cle  The key of the incarnation.
     */
    async retirerDe(item, cle) {
        if (item == null) return;
        const exemplaire = this.epoqueDe(item) === cle ? item : this.exemplaireDans(item.sid, cle);
        if (exemplaire == null) return;
        if (exemplaire.type === 'vecu') {
            await this.actor.deleteVecu(exemplaire);
        } else {
            await this.actor.deleteEmbeddedDocuments('Item', [exemplaire.id]);
        }
    }

    /**
     * @param item  An exemplar of the item, or the item of another incarnation.
     * @param degre The degre acquired during the incarnation.
     * @param cle   The key of the incarnation, the current one if omitted.
     */
    async modifierDegre(item, degre, cle = this.courante) {
        const exemplaire = this.epoqueDe(item) === cle ? item : this.exemplaireDans(item?.sid, cle);
        if (exemplaire == null) return;
        await exemplaire.update({ [Version.path(exemplaire, 'degre')]: degre });
    }

    /**
     * Garde la chronologie en accord avec une incarnation qu'on vient de supprimer sans passer
     * par `retirer`. Les autres items supprimés n'ont rien à défaire : ils portaient eux-mêmes
     * la clé de leur incarnation.
     *
     * Appelée par NephilimItem._onDeleteOperation, une fois par item supprimé, l'un après
     * l'autre et sur un seul client. Les suppressions qui s'en chargent elles-mêmes passent
     * l'option `incarnations: false`.
     * @param item The deleted embedded item.
     */
    static async apresSuppression(item) {
        if (item.type === 'incarnation') {
            await new Incarnations(item.actor).#raccrocher(item);
        }
    }

    /**
     * Une incarnation supprimée sans passer par `retirer` laisse un trou dans la chaîne : son
     * prédécesseur est raccroché à son successeur. Sans effet si la chaîne a déjà été recousue.
     * @param supprimee The deleted incarnation.
     */
    async #raccrocher(supprimee) {
        const predecesseur = this.incarnation(Version.data(supprimee).predecesseur);
        const successeur = this.incarnation(Version.data(supprimee).successeur);
        const updates = [];
        if (predecesseur != null && Version.data(predecesseur).successeur === supprimee.sid) {
            updates.push({ _id: predecesseur.id, [Version.path(predecesseur, 'successeur')]: successeur?.sid ?? null });
        }
        if (successeur != null && Version.data(successeur).predecesseur === supprimee.sid) {
            updates.push({ _id: successeur.id, [Version.path(successeur, 'predecesseur')]: predecesseur?.sid ?? null });
        }
        if (updates.length > 0) {
            await this.actor.updateEmbeddedDocuments('Item', updates);
        }
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
