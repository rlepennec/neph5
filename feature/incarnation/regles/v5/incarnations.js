import { DocumentIdentifier } from "../../../../module/common/documentIdentifier.js";
import { EmbeddedItem } from "../../../../module/common/embeddedItem.js";
import { Version } from "../../../../module/common/version.js";
import { AkashaDataModel } from "../../../akasha/item/akasha.mjs";
import { KaDataModel } from "../../../figure/ka.mjs";
import { LaboratoireDataModel } from "../../../alchimie/item/laboratoire.mjs";
import { Incarnations } from "../../incarnations.js";

/**
 * Les incarnations d'un acteur pour les règles v5 : tout ce que la façade commune (Incarnations,
 * chronologie et lien entre un objet et son incarnation) ne connaît pas.
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
export class IncarnationsV5 extends Incarnations {

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
    static LIES = [...IncarnationsV5.VECUS, ...IncarnationsV5.FOCUS, ...IncarnationsV5.CAPACITES, ...IncarnationsV5.VOIES,
        ...IncarnationsV5.EQUIPEMENTS, ...IncarnationsV5.STOCKS, ...IncarnationsV5.POSSESSIONS, ...IncarnationsV5.METAMORPHES];

    /**
     * Les types qui ont des valeurs propres à l'acteur (statut, focus, pacte...) et dont le
     * dépôt, déjà connus d'une autre incarnation, suit ses propres règles (voir
     * AbstractFeature.deposerParEpoque) : les focus et les capacités.
     */
    static PAR_EPOQUE = [...IncarnationsV5.FOCUS, ...IncarnationsV5.CAPACITES];

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
     * Les objets embarqués qui portent, pour chaque incarnation d'une figure, ce qui est propre
     * aux règles : par type, son modèle et ses champs (dans sa version). Un de chaque par
     * incarnation, créé avec elle (voir #creer), supprimé avec elle (voir retirer).
     */
    static REGLES = {
        laboratoire: { modele: LaboratoireDataModel, champs: ['alchimie'] },
        akasha: { modele: AkashaDataModel, champs: ['akasha'] },
        ka: { modele: KaDataModel, champs: ['ka', 'sapience', 'sapienceDepensee', 'pointsIncarnations', 'dommage', 'bonus'] }
    };

    /**
     * @param champ Un champ propre aux règles ('ka', 'alchimie', 'dommage'...).
     * @returns le type de l'objet qui le porte.
     */
    static typeDe(champ) {
        return Object.keys(IncarnationsV5.REGLES).find(type => IncarnationsV5.REGLES[type].champs.includes(champ));
    }

    /**
     * Les raisons pour lesquelles une incarnation ne peut être créée depuis un vécu.
     */
    static SANS_PERIODE = "Le vécu doit avoir une période pour pouvoir être déposé";
    static PERIODE_INCONNUE = "La période auquelle est rattachée le vécu n'existe pas";
    static DEJA_VECU = "Le vécu existe déjà";
    static VECU_INCONNU = "Le vécu n'existe pas dans le monde";

    // ------------------------------------------------------------------ les incarnations

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
        const periode = game.items.find(i => i.type === 'periode' && i.sid === incarnation.system.periode);
        const vecus = this.vecusDe(cle).map(v => v.name).join(", ");
        return (periode?.name ?? incarnation.name) + (vecus ? " — " + vecus : "");
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
        return this.chaine().filter(i => cles.has(i.sid));
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
            .filter(i => i.system.actif === true)
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
        const chaine = this.chaine();
        const index = chaine.findIndex(i => i.sid === cle);
        if (index === -1) return null;
        const cote = sens === 'anterieure' ? chaine.slice(0, index).reverse() : chaine.slice(index + 1);
        for (const incarnation of cote) {
            if (incarnation.system.actif !== true) continue;
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
            .filter(i => i.system.actif === true)
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
        if (!this.porte || !IncarnationsV5.EQUIPEMENTS.includes(data?.type)) return true;
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
        return sids.map(sid => this.exemplaireEffectif(sid)).filter(i => IncarnationsV5.#possede(i));
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
        if (cle == null || IncarnationsV5.#possede(this.exemplaireEffectif(sid))) return;
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
        const transmise = IncarnationsV5.#possede(this.voisine(sid, cle, 'anterieure')?.item);
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
     * @param type The type of a rules object ('laboratoire', 'akasha', 'ka').
     * @param cle  The key of an incarnation.
     * @returns l'objet de ce type de l'incarnation, null si elle n'en a pas.
     */
    objet(type, cle) {
        if (cle == null) return null;
        return this.actor.items.find(i => i.type === type && i.system?.incarnation === cle) ?? null;
    }

    /**
     * L'objet de ce type de l'incarnation, créé vide (valeurs du schéma) s'il manque.
     * @param type        The type of a rules object.
     * @param incarnation The incarnation.
     * @returns the rules object.
     */
    async #objetDe(type, incarnation) {
        const objet = this.objet(type, incarnation.sid);
        if (objet != null) return objet;
        const [cree] = await this.actor.createEmbeddedDocuments('Item', [IncarnationsV5.#donneesObjet(type, incarnation.sid, {})]);
        return cree;
    }

    /**
     * @param type The type of a rules object.
     * @param cle  The key of its incarnation.
     * @param v5   Its properties, by field.
     * @returns the data to create it.
     */
    static #donneesObjet(type, cle, v5) {
        return {
            name: type,
            type: type,
            system: { incarnation: cle, versions: { v5: v5 } }
        };
    }

    /**
     * @param champ Un champ propre aux règles.
     * @returns les données de l'objet qui le porte pour l'incarnation courante, vides s'il n'y
     *          en a pas.
     */
    #donneesDe(champ) {
        return Version.data(this.objet(IncarnationsV5.typeDe(champ), this.courante));
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
            if (cles.includes(k)) nombres[k] = IncarnationsV5.nombre(v);
        }
        return this.#ecrireBloc(champ, nombres);
    }

    /**
     * Les Ka de la figure : ceux de l'incarnation courante ; tous à 0 sans incarnation courante.
     * @returns { air, eau, feu, lune, terre, soleil, noyau, brume, orichalque, pavane, reserve,
     *          reserveCourante }.
     */
    kas() {
        return IncarnationsV5.#valeursDe(this.#donneesDe('ka').ka, IncarnationsV5.KA);
    }

    /**
     * @param valeurs Les Ka à écrire dans l'incarnation courante, par nom (ex: { air: 3 }).
     * @returns false if the actor has no current incarnation.
     */
    async ecrireKa(valeurs) {
        return this.#ecrireValeurs('ka', IncarnationsV5.KA, valeurs);
    }

    /**
     * Les bonus de la figure : ceux de l'incarnation courante ; tous à 0 sans incarnation
     * courante.
     * @returns { mouvement, initiative, dommage, protection }.
     */
    bonus() {
        return IncarnationsV5.#valeursDe(this.#donneesDe('bonus').bonus, IncarnationsV5.BONUS);
    }

    /**
     * @param valeurs Les bonus à écrire dans l'incarnation courante, par nom.
     * @returns false if the actor has no current incarnation.
     */
    async ecrireBonus(valeurs) {
        return this.#ecrireValeurs('bonus', IncarnationsV5.BONUS, valeurs);
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
        const modele = IncarnationsV5.REGLES[IncarnationsV5.typeDe(champ)].modele;
        return foundry.utils.deepClone(new modele({ id: 'vide' })._source.versions.v5[champ]);
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
        if (Object.keys(valeurs).length === 0) return true;
        // Dans l'objet qui porte le champ, créé s'il manque
        const objet = await this.#objetDe(IncarnationsV5.typeDe(champ), incarnation);
        const update = {};
        for (const [chemin, valeur] of Object.entries(valeurs)) {
            update[Version.path(objet, champ) + '.' + chemin] = valeur;
        }
        await objet.update(update);
        return true;
    }

    /**
     * Le laboratoire de la figure : celui de l'incarnation courante, indépendant de ceux des
     * autres époques ; le laboratoire vide sans incarnation courante.
     * @returns { constructs, primae, laboratoires, courant }.
     */
    alchimie() {
        return IncarnationsV5.#blocDe(this.#donneesDe('alchimie').alchimie, 'alchimie');
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
        return IncarnationsV5.#blocDe(this.#donneesDe('akasha').akasha, 'akasha');
    }

    /**
     * @param valeurs Les valeurs, par chemin dans les voyages akashiques (ex:
     *                { 'nef.active': true, 'boussole.zenith': 2 }).
     * @returns false if the actor has no current incarnation.
     */
    async ecrireAkasha(valeurs) {
        return this.#ecrireBloc('akasha', valeurs);
    }

    // ------------------------------------------------------------------ les blessures

    /**
     * Les blessures de la figure (bloc `dommage` : cases physiques et magiques) : celles de
     * l'incarnation courante, indépendantes de celles des autres époques. Elles ne se
     * transmettent pas : une nouvelle incarnation part sans blessure. Aucune sans incarnation
     * courante.
     * @returns { physique, magique }.
     */
    blessures() {
        return IncarnationsV5.#blocDe(this.#donneesDe('dommage').dommage, 'dommage');
    }

    /**
     * @param valeurs Les valeurs, par chemin dans les blessures (ex: { 'physique._1': true }).
     * @returns false if the actor has no current incarnation.
     */
    async ecrireBlessures(valeurs) {
        return this.#ecrireBloc('dommage', valeurs);
    }

    // ------------------------------------------------------------------ la sapience

    /**
     * Les compteurs de la figure : ceux de l'incarnation courante ; tous à 0 sans incarnation
     * courante.
     * @returns { sapience, sapienceDepensee, pointsIncarnations }.
     */
    compteurs() {
        const data = this.#donneesDe('sapience');
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
        const chaine = this.chaine();
        const posterieures = chaine.slice(chaine.findIndex(i => i.sid === cle) + 1);
        // Les compteurs sont portés par le ka de chaque incarnation, créé s'il manque
        const objets = new Map();
        for (const incarnation of [courante, ...posterieures]) {
            objets.set(incarnation.sid, await this.#objetDe('ka', incarnation));
        }
        const updates = new Map();
        const ecrire = (incarnation, champ, valeur) => {
            const objet = objets.get(incarnation.sid);
            const update = updates.get(objet.id) ?? { _id: objet.id };
            update[Version.path(objet, champ)] = valeur;
            updates.set(objet.id, update);
        };
        for (const champ of IncarnationsV5.SAPIENCES) {
            if (!(champ in valeurs)) continue;
            const ecart = IncarnationsV5.nombre(valeurs[champ]) - (Version.data(objets.get(cle))[champ] ?? 0);
            if (ecart === 0) continue;
            for (const incarnation of [courante, ...posterieures]) {
                ecrire(incarnation, champ, (Version.data(objets.get(incarnation.sid))[champ] ?? 0) + ecart);
            }
        }
        if ('pointsIncarnations' in valeurs) {
            ecrire(courante, 'pointsIncarnations', IncarnationsV5.nombre(valeurs.pointsIncarnations));
        }
        if (updates.size > 0) await this.actor.updateEmbeddedDocuments('Item', [...updates.values()]);
        return true;
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
        if (this.exemplaires(sid).length > 0) return IncarnationsV5.DEJA_VECU;
        const monde = game.items.find(i => i.type === 'vecu' && i.sid === sid);
        const periode = Version.data(monde)?.periode ?? null;
        if (periode == null) return IncarnationsV5.SANS_PERIODE;
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
        if (this.exemplaires(sid).length > 0) return { cle: null, refus: IncarnationsV5.DEJA_VECU };
        const monde = game.items.find(i => i.type === 'vecu' && i.sid === sid);
        if (monde == null) return { cle: null, refus: IncarnationsV5.VECU_INCONNU };
        if (game.items.find(i => i.type === 'periode' && i.sid === periode) == null) {
            return { cle: null, refus: IncarnationsV5.PERIODE_INCONNUE };
        }
        const cle = await this.ajouter(periode);
        await this.#embarquerVecu(monde, cle, degre);
        return { cle: cle, refus: null };
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
        if (this.exemplaires(sid).length > 0) return IncarnationsV5.DEJA_VECU;
        const monde = game.items.find(i => i.type === 'vecu' && i.sid === sid);
        if (monde == null) return IncarnationsV5.VECU_INCONNU;
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
     * Ce qu'une nouvelle incarnation reçoit de celle dont elle hérite, pour les règles v5 : ses
     * Ka et ses bonus (0 pour ceux qu'elle n'a pas), sa sapience et sa sapience dépensée, une
     * copie de son laboratoire et de ses voyages akashiques (vides du schéma si elle n'en a pas).
     * Les points d'incarnation partent de 0, sauf à les reprendre. Ce qui est commun à toutes
     * les versions (la stase) est hérité à part (voir heritageCommun).
     * Les blessures, les états, les armes et les armures ne se transmettent pas : elle part sans.
     * Sert à la création (#creer, depuis l'antérieure active la plus proche) et à la migration
     * 1.0.10 (depuis ce que portait la figure).
     * @param donnees            Les données dont hériter : la version d'une incarnation ou le
     *                           relevé de la figure ; {} pour aucune.
     * @param pointsIncarnations true pour reprendre aussi les points d'incarnation.
     * @returns { ka, bonus, alchimie, akasha, sapience, sapienceDepensee, pointsIncarnations }.
     */
    static heritage(donnees, { pointsIncarnations = false } = {}) {
        return {
            ka: IncarnationsV5.#valeursDe(donnees?.ka, IncarnationsV5.KA),
            bonus: IncarnationsV5.#valeursDe(donnees?.bonus, IncarnationsV5.BONUS),
            alchimie: IncarnationsV5.#blocDe(donnees?.alchimie, 'alchimie'),
            akasha: IncarnationsV5.#blocDe(donnees?.akasha, 'akasha'),
            sapience: donnees?.sapience ?? 0,
            sapienceDepensee: donnees?.sapienceDepensee ?? 0,
            pointsIncarnations: pointsIncarnations ? donnees?.pointsIncarnations ?? 0 : 0
        };
    }

    /**
     * @param cle      The key of an incarnation of a figure.
     * @param heritage Ce que l'incarnation reçoit pour les règles (voir heritage).
     * @returns les données des objets de règles à créer pour elle : laboratoire, akasha, ka
     *          (les blessures, non transmises, y prennent les valeurs du schéma).
     */
    static objetsDeRegles(cle, heritage) {
        return Object.entries(IncarnationsV5.REGLES).map(([type, { champs }]) => IncarnationsV5.#donneesObjet(type, cle,
            Object.fromEntries(champs.filter(champ => champ in heritage).map(champ => [champ, heritage[champ]]))));
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
        if (!this.porte || courante == null || !IncarnationsV5.LIES.includes(item?.type)) {
            await item.update(IncarnationsV5.#chemins(item, changements));
            return item;
        }
        const cible = this.epoqueDe(item) === courante ? item : this.exemplaireDans(item.sid, courante);
        if (cible != null) {
            await cible.update(IncarnationsV5.#chemins(cible, changements));
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

    // ------------------------------------------------------------------ l'affichage

    /**
     * @returns the incarnations and their attached items, as displayed by the incarnations tab.
     */
    chronologie() {

        const all = [];
        for (const p of this.ordonnees({ chrono: null })) {

            // Retrieve the periode of the world
            const periode = game.items.find(i => i.sid === p.system.periode);
            if (periode == null) {
                continue;
            }

            const vecus = this.#lignes(p.sid, IncarnationsV5.VECUS, true);
            const focus = this.#lignes(p.sid, IncarnationsV5.FOCUS, false);
            const capacites = this.#lignes(p.sid, IncarnationsV5.CAPACITES, false);

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
                    actif: p.system.actif,
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

    // ------------------------------------------------------------------ la création, la suppression

    /**
     * Ce qui se passe à la création d'une incarnation (voir JeuV5) : ce qui est propre aux règles,
     * les objets d'une figure, hérités de ceux de l'antérieure.
     * @param cle        The key of the created incarnation.
     * @param anterieure The nearest active previous incarnation, null if none.
     */
    async incarnationCreee(cle, anterieure) {
        if (this.actor.type !== 'figure') return;
        const donnees = Object.assign({}, ...Object.keys(IncarnationsV5.REGLES)
            .map(type => Version.data(this.objet(type, anterieure?.sid))));
        await this.actor.createEmbeddedDocuments('Item', IncarnationsV5.objetsDeRegles(cle, IncarnationsV5.heritage(donnees)));
    }

    /**
     * Supprime ce qui était lié à une incarnation retirée (voir JeuV5) : les vécus, avec leurs
     * dépendances, puis le reste.
     * @param items The items linked to the incarnation.
     */
    async supprimerLies(items) {

        // Delete the vecus, with their dependencies
        for (const vecu of items.filter(i => i.type === 'vecu')) {
            await this.actor.deleteVecu(vecu);
        }

        // Delete the other items
        const ids = items.filter(i => i.type !== 'vecu').map(i => i.id);
        if (ids.length > 0) {
            await this.actor.deleteEmbeddedDocuments('Item', ids);
        }
    }

}
