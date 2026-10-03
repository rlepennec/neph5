import { DocumentIdentifier } from "../../module/common/documentIdentifier.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Version } from "../../module/common/version.js";

/**
 * Les incarnations d'un acteur, vues d'un seul endroit.
 *
 * Aujourd'hui, une incarnation n'est pas un objet : c'est une PÉRIODE embarquée sur l'acteur.
 * Les périodes sont chaînées par leur champ `previous` (la première a `previous === null`),
 * chacune peut être activée ou non (`actif`), et l'acteur désigne la période courante par
 * son champ `periode`. Tout item acquis pendant une incarnation est une copie embarquée qui
 * porte le sid de sa période dans `periode`, et souvent son degré dans `degre` : un même item
 * qui a progressé sur plusieurs incarnations existe donc en plusieurs exemplaires.
 *
 * Cette classe est la seule à connaître cette représentation. Les lecteurs passent par elle
 * plutôt que de lire `periode`, `previous` et `actif` eux-mêmes : le jour où les incarnations
 * deviendront des items à part entière, seule cette classe changera.
 *
 * Elle lit, et elle écrit : ajout, déplacement, activation et retrait d'une période, période
 * courante, degré acquis pendant une incarnation, et — par `EmbeddedItem.withIncarnation` —
 * les champs qui rattachent un item créé à son incarnation.
 *
 * Une instance est faite pour être utilisée sur le champ, puis jetée : elle ne met rien en
 * cache, et lit toujours l'état courant de l'acteur.
 */
export class Incarnations {

    /**
     * Les types d'items affichés pour une incarnation, par rubrique de la fiche.
     */
    static VECUS = ['vecu', 'savoir', 'quete', 'arcane', 'chute', 'science', 'passe'];
    static FOCUS = ['sort', 'invocation', 'formule', 'rite', 'ordonnance', 'appel', 'habitus', 'pratique',
        'rituel', 'technique', 'tekhne', 'atlanteide', 'dracomachie', 'divination'];
    static CAPACITES = ['capacite'];

    /**
     * @param actor The actor (figure or fraternite) whose incarnations to read.
     */
    constructor(actor) {
        this.actor = actor;
    }

    // ------------------------------------------------------------------ les périodes

    /**
     * @returns {string|null} le sid de la période courante, null si aucune.
     */
    get courante() {
        return Version.data(this.actor).periode ?? null;
    }

    /**
     * @param sid The system identifier of the periode.
     * @returns the embedded periode, null if the actor has not lived it.
     */
    periode(sid) {
        if (sid == null) return null;
        return this.actor.items.find(i => i.type === 'periode' && i.sid === sid) ?? null;
    }

    /**
     * @returns all the embedded periodes, in no particular order.
     */
    toutes() {
        return this.actor.items.filter(i => i.type === 'periode');
    }

    /**
     * @returns the first periode of the chain, null if none.
     */
    premiere() {
        return this.actor.items.find(i => i.type === 'periode' && Version.data(i).previous === null) ?? null;
    }

    /**
     * @param sid The system identifier of a periode.
     * @returns the periode which follows the specified one, null if none.
     */
    suivante(sid) {
        return this.actor.items.find(i => i.type === 'periode' && Version.data(i).previous === sid) ?? null;
    }

    /**
     * Les périodes dans l'ordre de la chaîne, filtrées et bornées.
     *
     * @param chrono True for chronological order, false for antichronological, null for the
     *               display order, which follows the option chronologieDescendante.
     * @param actif  True for active periodes only, false for passive ones, null for all. The
     *               bounding periode is always included, whatever its activation.
     * @param jusqua The sid of the last periode included, null for no bound.
     * @returns the sorted embedded periodes.
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
        let previous = null;
        let found = false;

        while (true) {

            // Retrieve the next periode
            const p = this.suivante(previous);

            // Stop if the last periode
            if (p == null) {
                break;
            }

            // Check if the last periode
            if (jusqua != null && found === false && jusqua === p.sid) {
                found = true;
            }

            // Skip the first periodes to the last if inverse order.
            // Sans limite (jusqua == null), il n'y a aucune periode a ignorer.
            if (inverse === true && jusqua != null && found === false) {
                previous = p.sid;
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

            previous = p.sid;
        }

        // Sort the periodes according to the order
        if (inverse === true) {
            periodes = periodes.reverse();
        }

        return periodes;
    }

    /**
     * Une période compte si elle est activée et ne vient pas après la période courante.
     * @param sid The system identifier of the periode.
     * @returns true if the periode counts for the actor.
     */
    estActive(sid) {
        if (sid == null) return false;
        const p = this.ordonnees({ actif: true, jusqua: this.courante }).find(i => i.sid === sid);
        return p != null && Version.data(p).actif === true;
    }

    // ------------------------------------------------------------------ les rattachements

    /**
     * @param item An embedded item.
     * @returns {string|null} le sid de la période à laquelle l'item est rattaché.
     */
    rattachement(item) {
        return Version.data(item).periode ?? null;
    }

    /**
     * @param item An embedded item.
     * @returns true if the item is attached to a periode which counts for the actor.
     */
    estActif(item) {
        return this.periode(this.rattachement(item)) != null && this.estActive(this.rattachement(item));
    }

    /**
     * @param sid The system identifier of an item.
     * @returns every embedded copy of the item, one per periode where it was acquired.
     */
    exemplaires(sid) {
        return this.actor.items.filter(i => i.sid === sid);
    }

    /**
     * @param sid     The system identifier of an item.
     * @param periode The system identifier of a periode.
     * @returns true if the item has a copy attached to the periode.
     */
    aRattache(sid, periode) {
        return this.exemplaires(sid).some(i => this.rattachement(i) === periode);
    }

    /**
     * @param periode The system identifier of a periode.
     * @param types   The item types to keep, all if omitted.
     * @returns the embedded items attached to the periode.
     */
    rattaches(periode, types = null) {
        return this.actor.items.filter(i => this.rattachement(i) === periode && (types == null || types.includes(i.type)));
    }

    /**
     * Ce qu'un item doit à chaque incarnation, active ou non.
     * @param sid The system identifier of an item.
     * @returns the contributions, as { item, periode, degre }.
     */
    apports(sid) {
        return this.exemplaires(sid).map(item => ({
            item: item,
            periode: this.rattachement(item),
            degre: Version.data(item).degre ?? 0
        }));
    }

    /**
     * @param sid The system identifier of an item.
     * @returns the degre of the item, summed over the periodes which count.
     */
    degre(sid) {
        return this.apports(sid)
            .filter(a => this.estActive(a.periode))
            .reduce((total, a) => total + a.degre, 0);
    }

    /**
     * @returns the embedded vecus attached to a periode which counts.
     */
    vecusActifs() {
        return this.actor.items.filter(i => i.type === 'vecu' && this.estActif(i));
    }

    // ------------------------------------------------------------------ les écritures

    /**
     * Les champs qui rattachent un item, au moment de sa création, à une incarnation.
     * `EmbeddedItem.withIncarnation` les pose sur l'item créé : la façade décide seule de ce
     * qu'un rattachement écrit.
     * @param periode The system identifier of the periode.
     * @param degre   The degre acquired during the periode, undefined if the item has none.
     * @returns the fields to set, as [name, value] pairs.
     */
    static champsDeRattachement(periode, degre = undefined) {
        const champs = [['periode', periode]];
        if (degre !== undefined) champs.push(['degre', degre]);
        return champs;
    }

    /**
     * @param sid The system identifier of the periode to make current, null for none.
     */
    async definirCourante(sid) {
        await this.actor.update({ [Version.path(this.actor, 'periode')]: sid });
    }

    /**
     * @param item  The embedded item attached to an incarnation.
     * @param degre The degre acquired during this incarnation.
     */
    async modifierDegre(item, degre) {
        await item.update({ [Version.path(item, 'degre')]: degre });
    }

    /**
     * Ajoute une période vécue en tête de chaîne — la tête est la plus récente. La première
     * période ajoutée devient la courante.
     * @param sid The system identifier of the world periode.
     */
    async ajouter(sid) {
        const premiere = this.premiere();
        if (premiere != null) {
            await this.#chainer(premiere, sid);
        } else {
            await this.definirCourante(sid);
        }
        await new EmbeddedItem(this.actor, sid)
            .withContext("Drop of a periode")
            .withData("actif", true)
            .withData("previous", null)
            .withoutData('description', 'aube', 'contexte')
            .create();
    }

    /**
     * Déplace une période dans la chaîne, juste derrière une autre.
     * @param sid    The system identifier of the periode to move.
     * @param parent The system identifier of the periode which will precede it.
     */
    async deplacer(sid, parent) {

        // The target is not a periode
        if (this.periode(parent) == null) {
            return;
        }

        // The moved item
        const moved = this.periode(sid);

        // The old next periode of the moved periode
        const next = this.suivante(sid);

        // The periode which have his new previous periode equal to the moved periode
        const previous = this.suivante(parent);

        // A move is done
        if (Version.data(moved).previous !== parent && moved.sid !== parent && moved.sid !== previous?.sid) {
            await this.#chainer(next, Version.data(moved).previous);
            await this.#chainer(moved, parent);
            await this.#chainer(previous, sid);
        }
    }

    /**
     * Retire une période et tout ce qui lui est rattaché : la chaîne est recousue, la période
     * courante oubliée si c'était elle, les vécus supprimés avec leurs dépendances.
     * @param sid The system identifier of the periode to remove.
     */
    async retirer(sid) {

        // Figure or fraternite use chronological data
        if (this.actor.type === 'figure' || this.actor.type === 'fraternite') {

            // Update the next previous periode
            const next = this.suivante(sid);
            if (next != null) {
                await this.#chainer(next, Version.data(this.periode(sid)).previous);
            }

            // Remove the current actor periode if necessary
            if (this.courante === sid) {
                await this.definirCourante(null);
            }
        }

        // Delete all related vecus items
        for (const vecu of this.rattaches(sid, ['vecu'])) {
            await this.actor.deleteVecu(vecu);
        }

        // Delete other embedded items which are related to the periode
        await this.actor.deleteEmbeddedDocuments('Item', this.rattaches(sid).map(i => i.id));

        // Delete the embedded periode item
        await this.actor.deleteEmbeddedDocuments('Item', [this.actor.items.find(i => i.sid === sid).id]);
    }

    /**
     * @param sid The system identifier of the periode to activate or deactivate.
     */
    async basculer(sid) {
        const periode = this.periode(sid);
        await periode.update({ [Version.path(periode, 'actif')]: !Version.data(periode).actif });
    }

    /**
     * @param periode  The embedded periode to update, nothing done if null.
     * @param previous The system identifier of the periode which precedes it in the chain.
     */
    async #chainer(periode, previous) {
        await periode?.update({ [Version.path(periode, 'previous')]: previous });
    }

    // ------------------------------------------------------------------ l'affichage

    /**
     * @returns the periodes and their attached items, as displayed by the incarnations tab.
     */
    chronologie() {

        const all = [];
        for (const p of this.ordonnees()) {

            // Retrieve the periode of the world
            const periode = game.items.find(i => i.sid === p.sid);
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
     * @param periode The system identifier of the periode.
     * @param types   The item types to list, in display order.
     * @param degre   True to add the degre of each item.
     * @returns the display lines of the items attached to the periode.
     */
    #lignes(periode, types, degre) {
        const lignes = [];
        for (const type of types) {
            for (const i of this.rattaches(periode, [type])) {
                const original = game.items.find(o => o.sid === i.sid);
                if (original == null) continue;
                const ligne = {
                    name: original.name,
                    type: original.type,
                    id: i.id,
                    wid: original.id,
                    sid: i.sid
                };
                if (degre) ligne.degre = Version.data(i).degre;
                lignes.push(ligne);
            }
        }
        return lignes;
    }

}
