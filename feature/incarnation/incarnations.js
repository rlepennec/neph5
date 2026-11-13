import { Regles } from "../../module/regles/regles.js";

/**
 * Les incarnations d'un acteur, vues d'un seul endroit : la part commune à toutes les versions
 * de règles. Elle ne connaît aucune notion de règles (voir Regles).
 *
 * Une incarnation est un item `incarnation` embarqué sur l'acteur. Elle a sa propre identité :
 * son sid, la CLÉ par laquelle tout le reste la désigne. Elle porte :
 *
 *   - `periode` : le sid de la période du monde qu'elle incarne ; plusieurs incarnations
 *                 peuvent porter la même ;
 *   - `actif`   : l'incarnation compte-t-elle pour l'acteur ;
 *   - `predecesseur`, `successeur` : les clés des incarnations immédiatement plus ancienne et
 *                 plus récente — une liste doublement chaînée, dont la tête (sans
 *                 prédécesseur) est la plus ancienne ;
 *   - `stase`, `simulacre`.
 *
 * Un objet est lié à une incarnation par sa clé (`system.incarnation`, IncarnationField) : voir
 * epoqueDe et rattaches. Ce que signifie ce lien appartient aux règles : la façade d'une version
 * (par exemple IncarnationsV5) étend celle-ci. Supprimer une incarnation supprime ce qui lui est
 * lié, les autres incarnations gardant le leur.
 *
 * L'ordre « de chaîne » est l'ordre chronologique, de la plus ancienne à la plus récente. Une
 * incarnation créée arrive en QUEUE : elle devient la plus récente, et reçoit la stase de
 * l'antérieure active la plus proche. L'ordre d'affichage est l'affaire des règles (pour la v5,
 * l'option chronologieDescendante, voir IncarnationsV5.chronologie).
 *
 * Une instance est faite pour être utilisée sur le champ, puis jetée : elle ne met rien en cache.
 */
export class Incarnations {

    /**
     * Les types d'acteur qui vivent des incarnations.
     */
    static ACTEURS = ['figure', 'fraternite'];

    /**
     * @param actor The actor whose incarnations to read or write.
     */
    constructor(actor) {
        this.actor = actor;
    }

    /**
     * @returns true if the actor lives incarnations.
     */
    get porte() {
        return Incarnations.ACTEURS.includes(this.actor?.type);
    }

    // ------------------------------------------------------------------ les incarnations

    /**
     * @returns {string|null} la clé de l'incarnation courante, null si aucune.
     */
    get courante() {
        return this.actor?.system?.periode ?? null;
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
        return this.incarnation(cle)?.system.periode ?? null;
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
    chaine() {
        const toutes = this.toutes();
        const parCle = new Map(toutes.map(i => [i.sid, i]));
        const chaine = [];
        const vus = new Set();
        let courante = toutes.find(i => {
            const predecesseur = i.system.predecesseur;
            return predecesseur == null || !parCle.has(predecesseur);
        });
        while (courante != null && !vus.has(courante.sid)) {
            chaine.push(courante);
            vus.add(courante.sid);
            const successeur = courante.system.successeur;
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
            const data = incarnation.system;
            if ((data.predecesseur ?? null) !== predecesseur || (data.successeur ?? null) !== successeur) {
                updates.push({
                    _id: incarnation.id,
                    'system.predecesseur': predecesseur,
                    'system.successeur': successeur
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
        return this.chaine()[0] ?? null;
    }

    /**
     * @param cle The key of an incarnation, null for the head of the chain.
     * @returns the incarnation which follows the specified one in chain order — the next more
     *          recent — null if none.
     */
    suivante(cle) {
        const chaine = this.chaine();
        if (cle == null) return chaine[0] ?? null;
        const index = chaine.findIndex(i => i.sid === cle);
        return index === -1 ? null : chaine[index + 1] ?? null;
    }

    /**
     * Les incarnations dans l'ordre, filtrées et bornées.
     *
     * @param chrono True for chronological order (from the oldest to the bound), false for the
     *               reverse.
     * @param actif  True for active incarnations only, false for passive ones, null for all.
     *               The bounding one is always included, whatever its activation.
     * @param jusqua The key of the last incarnation included, null for no bound: the
     *               incarnations more recent than it are never read.
     * @returns the sorted incarnations.
     */
    ordonnees({ chrono = true, actif = null, jusqua = null } = {}) {

        // The most recent incarnation comes first
        const inverse = (chrono === false);

        // Retrieve incarnations from the oldest to the last one
        let periodes = [];

        for (const p of this.chaine()) {

            // Add periode if required
            if (actif == null || jusqua === p.sid || p.system.actif === actif) {
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
        return p != null && p.system.actif === true;
    }

    // ------------------------------------------------------------------ le lien entre un objet et son incarnation

    /**
     * @param item An embedded item.
     * @returns {string|null} la clé de l'incarnation à laquelle il est lié, null s'il n'en a pas.
     */
    epoqueDe(item) {
        return item?.system?.incarnation ?? null;
    }

    /**
     * @param cle   The key of an incarnation.
     * @param types The item types to keep, all if omitted.
     * @returns the items linked to the incarnation, in actor order.
     */
    rattaches(cle, types = null) {
        if (cle == null) return [];
        return this.actor.items.filter(i => this.epoqueDe(i) === cle && (types == null || types.includes(i.type)));
    }

    // ------------------------------------------------------------------ les valeurs par époque

    /**
     * @param valeur Une valeur saisie.
     * @returns la valeur en nombre, 0 si elle n'en est pas un.
     */
    static nombre(valeur) {
        const n = Number(valeur);
        return isNaN(n) ? 0 : n;
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
        return Incarnations.#staseDe(this.incarnation(this.courante)?.system.stase);
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
        const stase = { description: "", ka: 0, ...(Incarnations.#staseDe(incarnation.system.stase) ?? {}) };
        if ('description' in valeurs) stase.description = String(valeurs.description ?? "").trim();
        if ('ka' in valeurs) stase.ka = Incarnations.nombre(valeurs.ka);
        const vide = stase.description === "" && stase.ka === 0;
        await incarnation.update({ 'system.stase': vide ? null : stase });
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
        const sid = this.incarnation(this.courante)?.system.simulacre ?? null;
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
        await incarnation.update({ 'system.simulacre': sid });
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
            .filter(i => sids.includes(i.system.simulacre))
            .map(i => ({ _id: i.id, 'system.simulacre': null }));
        if (updates.length > 0) {
            await this.actor.updateEmbeddedDocuments('Item', updates);
        }
    }

    // ------------------------------------------------------------------ créer, supprimer

    /**
     * Crée une incarnation à partir de sa période. Elle arrive en queue de la chaîne, et devient
     * la courante si c'est la première.
     * @param periode The system identifier of the world periode.
     * @returns {string|null} la clé de l'incarnation créée.
     */
    async ajouter(periode) {
        if (game.items.find(i => i.type === 'periode' && i.sid === periode) == null) return null;
        return await this.#creer(periode);
    }

    /**
     * Change la période d'une incarnation.
     * @param cle     The key of the incarnation.
     * @param periode The system identifier of the world periode.
     */
    async changerPeriode(cle, periode) {
        const incarnation = this.incarnation(cle);
        const monde = game.items.find(i => i.type === 'periode' && i.sid === periode);
        if (incarnation == null || monde == null) return;
        await incarnation.update({ name: monde.name, img: monde.img, 'system.periode': periode });
    }

    /**
     * Retire une incarnation, et ce qui lui est lié : la version le supprime à sa façon si elle a
     * des dépendances à traiter (voir Regles). Les autres incarnations gardent le leur.
     * @param cle The key of the incarnation.
     */
    async retirer(cle) {

        const incarnation = this.incarnation(cle);
        if (incarnation == null) return;

        // Remove the current incarnation if necessary
        if (this.courante === cle) {
            await this.definirCourante(null);
        }

        // What is linked to it goes with it
        const siens = this.rattaches(cle);

        // Mend the chain around it, then delete it
        await this.#chainer(this.chaine().filter(i => i.sid !== cle));
        await this.actor.deleteEmbeddedDocuments('Item', [incarnation.id]);

        // La version supprime ce qui est lié à sa façon, si elle a des dépendances à traiter
        const regles = Regles.courantes;
        if (regles.supprimerLies != null) {
            await regles.supprimerLies(this.actor, siens);
        } else if (siens.length > 0) {
            await this.actor.deleteEmbeddedDocuments('Item', siens.map(i => i.id));
        }

        // Et ce qu'elle y rattache ailleurs
        await regles.incarnationRetiree?.(this.actor, cle);
    }

    /**
     * Ce qu'une nouvelle incarnation reçoit de celle dont elle hérite, commun à toutes les
     * versions de règles : sa stase (aucune si elle n'en a pas). Sa place dans la chronologie
     * et son simulacre, eux, ne se transmettent pas.
     * @param donnees Les données communes dont hériter : `system` d'une incarnation ou le relevé
     *                de la figure ; {} pour aucune.
     * @returns { stase }.
     */
    static heritageCommun(donnees) {
        return {
            stase: Incarnations.#staseDe(donnees?.stase)
        };
    }

    /**
     * Crée une incarnation EN QUEUE de la chronologie : elle devient la plus récente. Elle
     * hérite de l'incarnation antérieure active la plus proche (voir heritageCommun), et la version
     * y ajoute ce qui est propre à ses règles (voir Regles).
     * @param periode The system identifier of the world periode.
     * @returns {string} la clé de l'incarnation créée.
     */
    async #creer(periode) {
        const monde = game.items.find(i => i.type === 'periode' && i.sid === periode);
        const chaine = this.chaine();
        const derniere = chaine.at(-1) ?? null;
        const anterieure = [...chaine].reverse().find(i => i.system.actif === true) ?? null;
        // Sans system.id, l'item reçoit un identifiant neuf à sa création (NephilimItem._preCreate).
        const [cree] = await this.actor.createEmbeddedDocuments('Item', [{
            name: monde?.name ?? periode,
            type: 'incarnation',
            img: monde?.img,
            system: {
                periode: periode,
                actif: true,
                predecesseur: derniere?.sid ?? null,
                successeur: null,
                ...Incarnations.heritageCommun(anterieure?.system)
            }
        }]);
        // Ce qui est propre aux règles : la version y pourvoit, si elle en a
        await Regles.courantes.incarnationCreee?.(this.actor, cree.sid, anterieure);
        if (derniere == null) {
            await this.definirCourante(cree.sid);
        } else {
            await derniere.update({ 'system.successeur': cree.sid });
        }
        return cree.sid;
    }

    // ------------------------------------------------------------------ les autres écritures

    /**
     * @param cle The key of the incarnation to make current, null for none.
     */
    async definirCourante(cle) {
        await this.actor.update({ 'system.periode': cle });
    }

    /**
     * Déplace une incarnation dans la chronologie : juste après une autre, c'est-à-dire juste
     * plus récente qu'elle.
     * @param cle    The key of the incarnation to move.
     * @param parent The key of the incarnation which will precede it.
     */
    async deplacer(cle, parent) {

        const chaine = this.chaine();
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
        await incarnation.update({ 'system.actif': !incarnation.system.actif });
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
        const predecesseur = this.incarnation(supprimee.system.predecesseur);
        const successeur = this.incarnation(supprimee.system.successeur);
        const updates = [];
        if (predecesseur != null && predecesseur.system.successeur === supprimee.sid) {
            updates.push({ _id: predecesseur.id, 'system.successeur': successeur?.sid ?? null });
        }
        if (successeur != null && successeur.system.predecesseur === supprimee.sid) {
            updates.push({ _id: successeur.id, 'system.predecesseur': predecesseur?.sid ?? null });
        }
        if (updates.length > 0) {
            await this.actor.updateEmbeddedDocuments('Item', updates);
        }
    }

}
