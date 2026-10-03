import { DocumentIdentifier } from "../../module/common/documentIdentifier.js";
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
 * Elle ne fait que lire. Les écritures (dépôt, déplacement, activation, suppression d'une
 * période) passeront par elle à l'étape suivante.
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
