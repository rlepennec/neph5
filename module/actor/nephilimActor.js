import { Incarnations } from "../../feature/incarnation/incarnations.js";
import { VersionMigration } from "../migration/versionMigration.js";
import { Regles } from "../regles/regles.js";
import { CustomHandlebarsHelpers } from "../common/handlebars.js";

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
        return new Incarnations(this).simulacre();
    }


    /**
     * Bascule un état depuis le HUD du jeton ou le suivi de combat. Les règles peuvent le poser
     * ailleurs que sur l'acteur (basculerEtat, voir Regles) ; sinon, la logique de Foundry.
     * @override
     */
    async toggleStatusEffect(statusId, options = {}) {
        const parDefaut = () => super.toggleStatusEffect(statusId, options);
        const regles = this.regles;
        return regles.basculerEtat != null ? regles.basculerEtat(statusId, options, parDefaut) : parDefaut();
    }

    /**
     * Les règles réagissent aux modifications de l'acteur, sur tous les clients (apresModification,
     * voir Regles).
     * @override
     */
    _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);
        this.regles.apresModification?.(changed);
    }

    // ----------------------------------------------------------------------------------------------

    /**
     * Deletes the specified embedded item. Une incarnation part avec ce qui lui est lié ; les
     * règles suppriment les autres objets à leur façon si elles le veulent (supprimerObjet, voir
     * Regles).
     * @param item The embedded item to delete.
     */
    async deleteEmbeddedItem(item) {
        if (item == null) return;
        switch (item.type) {
            case 'periode':
                await this.deletePeriode(item.sid);
                break;
            case 'incarnation':
                await this.deleteIncarnation(item.sid);
                break;
            default: {
                const regles = this.regles;
                if (regles.supprimerObjet != null) {
                    await regles.supprimerObjet(item);
                } else {
                    await this.deleteEmbeddedDocuments('Item', [item.id]);
                }
            }
        }
    }

    /**
     * Retire toutes les incarnations d'une période du monde — la période est supprimée.
     * @param sid The system identifier of the world periode.
     */
    async deletePeriode(sid) {
        const incarnations = new Incarnations(this);
        for (const incarnation of incarnations.toutes().filter(i => incarnations.periodeDe(i.sid) === sid)) {
            await incarnations.retirer(incarnation.sid);
        }
        await this.render();
    }

    /**
     * Retire une incarnation et ce qui lui est lié (voir Incarnations.retirer).
     * @param cle The key of the incarnation.
     */
    async deleteIncarnation(cle) {
        await new Incarnations(this).retirer(cle);
        await this.render();
    }

    /**
     * @param sid The system identifier of current periode to set.
     */
    async setCurrentPeriode(sid) {
        await new Incarnations(this).definirCourante(sid);
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
        await new Incarnations(actor).oublierSimulacres(sids);

        // Ce que les règles y rattachent, l'effectif d'une fraternité par exemple (voir Regles)
        await actor.regles.acteursSupprimes?.(sids);

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