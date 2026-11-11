import { ActiveEffects } from "../../feature/core/regles/v5/effects.js";
import { IncarnationsV5 } from "../../feature/incarnation/regles/v5/incarnations.js";
import { Version } from "../../module/common/version.js";
import { VersionMigration } from "../migration/versionMigration.js";
import { Regles } from "../regles/regles.js";
import { CustomHandlebarsHelpers } from "../common/handlebars.js";
import { Fraternite } from "../../feature/fraternite/regles/v5/fraternite.js";
import { Periode } from "../../feature/periode/periode.js";

export class NephilimActor extends Actor {

    /**
     * Le crochet du document Actor, avant tout élagage — voir VersionMigration.releveIncarnations.
     * @param source The raw source data, as stored.
     * @returns the migrated source data.
     */
    static migrateData(source) {
        return super.migrateData(VersionMigration.releveIncarnations(source));
    }

    /**
     * @returns the system identifier.
     */
    get sid() {
        return this?.system?.id;
    }

    /**
     * @returns l'objet des règles de cet acteur pour la version du monde (voir Regles) ; un objet
     *          vide si elle ne fournit rien pour les acteurs.
     */
    get regles() {
        return Regles.acteur(this);
    }

    /**
     * Garantit l'unicité de l'identifiant métier system.id.
     *
     * system.id est distinct de l'_id de Foundry : c'est par lui que les
     * documents se retrouvent (game.actors.find(a => a.sid === …)). Deux
     * acteurs du monde qui le partagent rendent ces recherches ambiguës, sans
     * la moindre erreur affichée.
     *
     * L'ancienne règle vivait dans un hook global de neph5e.js et reconnaissait
     * un doublon au suffixe " (Copy)" du nom : elle ne couvrait que le bouton
     * Dupliquer, et seulement tant que le module de traduction française du
     * cœur de Foundry n'était pas installé — sinon le nom finit par « (Copie) »
     * et plus aucun doublon n'était détecté. La règle porte désormais sur trois
     * signaux indépendants de la langue, dans l'ordre du moins cher au plus
     * cher. C'est la transposition de ce que NephilimItem._preCreate faisait
     * déjà pour les items ; les acteurs n'en avaient pas d'équivalent.
     *
     * @override
     */
    async _preCreate(data, options, user) {
        const allowed = await super._preCreate(data, options, user);
        if (allowed === false) return false;

        // 1. Foundry marque lui-même les duplications, quelle que soit la langue.
        const duplique = data._stats?.duplicateSource != null && !this.isToken;

        // 2. Identifiant absent : UUIDField en fournit normalement un, mais un
        //    document importé d'une version ancienne peut arriver sans.
        const absent = data.system?.id == null || data.system?.id === "";

        // 3. Filet de sécurité : identifiant déjà porté par un acteur du monde.
        //    Couvre le copier-coller et le ré-import d'un acteur déjà présent,
        //    que duplicateSource ne marque pas. Laisser l'identifiant au premier
        //    ne casse aucun lien : game.actors.find renvoie déjà celui-là.
        //
        //    L'acteur d'un token non lié est exclu, comme l'est un item embarqué
        //    dans NephilimItem : il est une copie de l'acteur du monde et doit en
        //    garder l'identifiant. Sans cette exclusion, il en recevrait un neuf
        //    et se détacherait de sa source.
        const pris = !this.isToken && !duplique && !absent
            && game.actors.find(a => a.sid === data.system.id) != null;

        if (duplique || absent || pris) {
            this.updateSource({ "system.id": NephilimActor.identifiantLibre() });
        }
    }

    /**
     * @returns un identifiant métier qu'aucun acteur du monde ne porte.
     */
    static identifiantLibre() {
        let sid;
        do {
            sid = CustomHandlebarsHelpers.UUID();
        } while (game.actors.find(a => a.sid === sid) != null);
        return sid;
    }

    


    /**
     * @returns the simulacre as actor object, undefined if not exist.
     */
    get simulacre() {
        // Celui de l'incarnation courante : il ne se transmet pas
        return new IncarnationsV5(this).simulacre();
    }


    /**
     * Bascule un état depuis le HUD du jeton ou le suivi de combat. Ceux d'une figure sont
     * portés par son incarnation courante (voir ActiveEffects.porteur) : sans elle, aucun.
     * Même logique que celle de Foundry, sur l'incarnation au lieu de l'acteur ; un token non lié
     * ignore en plus les états de son acteur (voir NephilimActiveEffect).
     * @override
     */
    async toggleStatusEffect(statusId, { active, overlay = false } = {}) {
        const porteur = ActiveEffects.porteur(this);
        if (porteur === this && !this.isToken) return super.toggleStatusEffect(statusId, { active, overlay });
        if (porteur == null) return;
        const status = CONFIG.statusEffects[statusId];
        if (!status) throw new Error(`Invalid status ID "${statusId}" provided to Actor#toggleStatusEffect`);

        // Les effets de cet état déjà portés, hors ceux hérités de l'acteur d'un token non lié
        const existing = status._id
            ? [porteur.effects.get(status._id)].filter(e => e != null && !e.herite).map(e => e.id)
            : porteur.effects.filter(e => e.statuses.size === 1 && e.statuses.has(status.id) && !e.herite).map(e => e.id);
        if (existing.length > 0) {
            if (active) return true;
            await porteur.deleteEmbeddedDocuments("ActiveEffect", existing);
            return false;
        }

        if (!active && active !== undefined) return;
        const ActiveEffect = CONFIG.ActiveEffect.documentClass;
        const effect = await ActiveEffect.fromStatusEffect(statusId, { parent: porteur });
        if (overlay) effect.updateSource({ "flags.core.overlay": true });
        effect.updateSource({ transfer: true });
        return ActiveEffect.create(effect.toObject(), { parent: porteur, keepId: true });
    }

    /**
     * Les états d'une figure suivent son incarnation courante : quand elle change, les icônes
     * de ses jetons sont redessinées, sur tous les clients.
     * @override
     */
    _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);
        if (foundry.utils.getProperty(changed, Version.path(this, 'periode')) !== undefined) {
            for (const token of this.getActiveTokens()) token.drawEffects();
        }
    }

    /**
     * @returns the name of the current periode.
     */
    get currentPeriode() {
        const incarnations = new IncarnationsV5(this);
        if (incarnations.courante == null) {
            return "Aucune periode courante";
        }
        const periode = game.items.find(i => i.sid === incarnations.periodeDe(incarnations.courante));
        return periode == null ? "Periode non trouvee" : periode.name;
    }

    // ----------------------------------------------------------------------------------------------

    /**
     * Deletes the specified embedded item.
     * @param item The embedded item to delete.
     */
    async deleteEmbeddedItem(item) {
        if (item != null) {
            switch (item.type) {
                case 'periode':
                    await this.deletePeriode(item.sid);
                    break;
                case 'incarnation':
                    await this.deleteIncarnation(item.sid);
                    break;
                case 'vecu':
                    await this.regles.deleteVecu(item);
                    break;
                case 'competence':
                    await this.regles.deleteCompetence(item);
                    break;
                default:
                    await this.deleteEmbeddedDocuments('Item', [item.id]);
                    break;
            }
        }
    }

    /**
     * Retire toutes les incarnations d'une période du monde — la période est supprimée.
     * @param sid The system identifier of the world periode.
     */
    async deletePeriode(sid) {
        const incarnations = new IncarnationsV5(this);
        for (const incarnation of incarnations.toutes().filter(i => incarnations.periodeDe(i.sid) === sid)) {
            await this.#retirerIncarnation(incarnations, incarnation.sid);
        }
        await this.render();
    }

    /**
     * Retire une incarnation, son vécu et ce qui ne doit rien à une autre.
     * @param cle The key of the incarnation.
     */
    async deleteIncarnation(cle) {
        await this.#retirerIncarnation(new IncarnationsV5(this), cle);
        await this.render();
    }

    /**
     * @param incarnations The incarnations of this actor.
     * @param cle          The key of the incarnation to remove.
     */
    async #retirerIncarnation(incarnations, cle) {
        await incarnations.retirer(cle);
        if (this.type === 'fraternite') {
            await new Fraternite(this).onDeletePeriode({ sid: cle });
        }
    }
 
    /**
     * @param sid The system identifier of current periode to set.
     */
    async setCurrentPeriode(sid) {
        await new IncarnationsV5(this).definirCourante(sid);
    }

    /**
     * Retire les acteurs supprimés des simulacres et des effectifs de fraternité.
     *
     * Ce nettoyage se fait une fois par opération de suppression, et non dans _onDelete.
     * Foundry appelle _onDelete pour chaque document supprimé sans l'attendre, et sur
     * tous les clients connectés. Supprimer plusieurs acteurs d'un coup (sélection
     * multiple, dossier) lançait donc des mises à jour concurrentes du même effectif :
     * chacune partait de l'effectif d'avant et n'en retirait qu'un acteur, la dernière
     * écrite l'emportait, et les autres membres supprimés restaient dans l'effectif.
     *
     * Un seul client agit : le MJ actif, ou à défaut l'auteur de la suppression.
     * La suppression d'un acteur de compendium ne touche pas le monde.
     *
     * @Override
     */
    static async _onDeleteOperation(documents, operation, user) {
        await super._onDeleteOperation(documents, operation, user);

        // Only world actors
        if (operation.pack != null || operation.parent != null) {
            return;
        }

        // Only one client
        const designated = game.users.activeGM ?? user;
        if (designated?.id !== game.user.id) {
            return;
        }

        const sids = documents.map(d => d.sid).filter(sid => sid != null);
        if (sids.length === 0) {
            return;
        }

        for (let actor of game.actors) {
            await NephilimActor.onDeleteEmbeddedActors(actor, sids);
        }

        for (let scene of game.scenes) {
            for (let token of scene.tokens) {
                if (token.actor != null) {
                    await NephilimActor.onDeleteEmbeddedActors(token.actor, sids);
                }
            }
        }
    }

    /**
     * Delete the deleted actors from the specified container actor.
     * @param actor The actor for which to delete the deleted actors.
     * @param sids  The system identifiers of the deleted actors.
     */
    static async onDeleteEmbeddedActors(actor, sids) {

        // Remove the deleted actors from the incarnations which had them as simulacre
        if (actor.type === 'figure') {
            await new IncarnationsV5(actor).oublierSimulacres(sids);
        }

        // Remove the deleted actors if they are members of a fraternite
        if (actor.type === 'fraternite') {
            await new Fraternite(actor).onDeleteActors(sids);
        }

    }

    /**
     * Un lien vers un acteur (chat, description...) ouvre sa fiche. Sans droit de lecture,
     * la fiche refuse de s'afficher et Foundry ne le signale que dans la console : le
     * joueur cliquait sans rien voir. Il est désormais averti.
     * @override
     */
    _onClickDocumentLink(event) {
        if (this.sheet?.isVisible === false) {
            ui.notifications.error("Vous n'avez pas les droits de lecture sur « " + this.name + " ».");
            return null;
        }
        return super._onClickDocumentLink(event);
    }

    // Pas de surcharge de render() : celle de Foundry réaffiche les fenêtres ouvertes de l'acteur
    // sans les forcer. Foundry l'appelle lui-même à chaque modification de l'acteur ou de ses
    // items ; une surcharge qui forçait sheet.render(true) ramenait la fiche au premier plan, par
    // exemple devant le formulaire d'incarnation après un dépôt.

    // ------------------------------------------------------------------ les macros déjà posées

    /**
     * Les macros glissées dans la barre avant la 1.8.0 contiennent le texte
     * `token.actor.processMacro(...)` (voir macros.js) : ce relais les garde en état de marche.
     * Les nouvelles passent par actor.regles. Sans règles qui le fournissent, la macro ne fait rien.
     */
    processMacro(...args) {
        return this.regles.processMacro?.(...args);
    }

}