import { ActiveEffects } from "../../feature/core/regles/v5/effects.js";
import { IncarnationsV5 } from "../../feature/incarnation/regles/v5/incarnations.js";
import { Version } from "../../module/common/version.js";
import { VersionMigration } from "../migration/versionMigration.js";
import { Regles } from "../regles/regles.js";
import { ActeurV5 } from "./regles/v5/acteurV5.js";
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
                    await this.deleteVecu(item);
                    break;
                case 'competence':
                    await this.deleteCompetence(item);
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

    // ------------------------------------------------------------------ les relais vers les règles v5

    // Temporaires : le temps que les appelants passent à actor.regles (voir ActeurV5).

    get mouvement() {
        return new ActeurV5(this).mouvement;
    }

    get perspicacite() {
        return new ActeurV5(this).perspicacite;
    }

    get recuperation() {
        return new ActeurV5(this).recuperation;
    }

    get voile() {
        return new ActeurV5(this).voile;
    }

    get kas() {
        return new ActeurV5(this).kas;
    }

    get alchimie() {
        return new ActeurV5(this).alchimie;
    }

    get akasha() {
        return new ActeurV5(this).akasha;
    }

    get blessures() {
        return new ActeurV5(this).blessures;
    }

    ecrireBlessures(...args) {
        return new ActeurV5(this).ecrireBlessures(...args);
    }

    get bonus() {
        return new ActeurV5(this).bonus;
    }

    get ka() {
        return new ActeurV5(this).ka;
    }

    get voieMagique() {
        return new ActeurV5(this).voieMagique;
    }

    get voieAlchimique() {
        return new ActeurV5(this).voieAlchimique;
    }

    get arcanes() {
        return new ActeurV5(this).arcanes;
    }

    get capacites() {
        return new ActeurV5(this).capacites;
    }

    get catalyseurs() {
        return new ActeurV5(this).catalyseurs;
    }

    get chutes() {
        return new ActeurV5(this).chutes;
    }

    get khaiba() {
        return new ActeurV5(this).khaiba;
    }

    get narcose() {
        return new ActeurV5(this).narcose;
    }

    get ombre() {
        return new ActeurV5(this).ombre;
    }

    get luneNoire() {
        return new ActeurV5(this).luneNoire;
    }

    get competences() {
        return new ActeurV5(this).competences;
    }

    get imago() {
        return new ActeurV5(this).imago;
    }

    get metamorphe() {
        return new ActeurV5(this).metamorphe;
    }

    get ordonnances() {
        return new ActeurV5(this).ordonnances;
    }

    get materiae() {
        return new ActeurV5(this).materiae;
    }

    get passes() {
        return new ActeurV5(this).passes;
    }

    get periodes() {
        return new ActeurV5(this).periodes;
    }

    get quetes() {
        return new ActeurV5(this).quetes;
    }

    get savoirs() {
        return new ActeurV5(this).savoirs;
    }

    get sciences() {
        return new ActeurV5(this).sciences;
    }

    get vecusOfActor() {
        return new ActeurV5(this).vecusOfActor;
    }

    get vecusOfSimulacre() {
        return new ActeurV5(this).vecusOfSimulacre;
    }

    fraternite(...args) {
        return new ActeurV5(this).fraternite(...args);
    }

    numberOfFocus(...args) {
        return new ActeurV5(this).numberOfFocus(...args);
    }

    science(...args) {
        return new ActeurV5(this).science(...args);
    }

    savoir(...args) {
        return new ActeurV5(this).savoir(...args);
    }

    cercles(...args) {
        return new ActeurV5(this).cercles(...args);
    }

    focus(...args) {
        return new ActeurV5(this).focus(...args);
    }

    get laboratoires() {
        return new ActeurV5(this).laboratoires;
    }

    get fraternites() {
        return new ActeurV5(this).fraternites;
    }

    get membres() {
        return new ActeurV5(this).membres;
    }

    isNewMember(...args) {
        return new ActeurV5(this).isNewMember(...args);
    }

    processMacro(...args) {
        return new ActeurV5(this).processMacro(...args);
    }

    getMaxBaseMP(...args) {
        return new ActeurV5(this).getMaxBaseMP(...args);
    }

    getConstruct(...args) {
        return new ActeurV5(this).getConstruct(...args);
    }

    approches(...args) {
        return new ActeurV5(this).approches(...args);
    }

    static libelleApproche(...args) {
        return ActeurV5.libelleApproche(...args);
    }

    getKa(...args) {
        return new ActeurV5(this).getKa(...args);
    }

    deleteVecu(...args) {
        return new ActeurV5(this).deleteVecu(...args);
    }

    deleteCompetence(...args) {
        return new ActeurV5(this).deleteCompetence(...args);
    }

    rollPasse(...args) {
        return new ActeurV5(this).rollPasse(...args);
    }

    get desoriente() {
        return new ActeurV5(this).desoriente;
    }

    get immobilise() {
        return new ActeurV5(this).immobilise;
    }

    get projete() {
        return new ActeurV5(this).projete;
    }

    get dommage() {
        return new ActeurV5(this).dommage;
    }

    get initiative() {
        return new ActeurV5(this).initiative;
    }

    manoeuvre(...args) {
        return new ActeurV5(this).manoeuvre(...args);
    }

    get isLutteAvailable() {
        return new ActeurV5(this).isLutteAvailable;
    }

    get lutte() {
        return new ActeurV5(this).lutte;
    }

    get isEsquiveAvailable() {
        return new ActeurV5(this).isEsquiveAvailable;
    }

    get esquive() {
        return new ActeurV5(this).esquive;
    }

    get target() {
        return new ActeurV5(this).target;
    }

    get targets() {
        return new ActeurV5(this).targets;
    }

    get tokenOf() {
        return new ActeurV5(this).tokenOf;
    }

    protection(...args) {
        return new ActeurV5(this).protection(...args);
    }

    setActiveEffect(...args) {
        return new ActeurV5(this).setActiveEffect(...args);
    }

    activateEffect(...args) {
        return new ActeurV5(this).activateEffect(...args);
    }

    deactivateEffect(...args) {
        return new ActeurV5(this).deactivateEffect(...args);
    }

    toggleEquipmentUsage(...args) {
        return new ActeurV5(this).toggleEquipmentUsage(...args);
    }

    get weapons() {
        return new ActeurV5(this).weapons;
    }

    get armors() {
        return new ActeurV5(this).armors;
    }

    getWoundsModifier(...args) {
        return new ActeurV5(this).getWoundsModifier(...args);
    }

    get physicalModifier() {
        return new ActeurV5(this).physicalModifier;
    }

    get magicalModifier() {
        return new ActeurV5(this).magicalModifier;
    }

    get combatant() {
        return new ActeurV5(this).combatant;
    }

    rollWeapon(...args) {
        return new ActeurV5(this).rollWeapon(...args);
    }

    rollWrestle(...args) {
        return new ActeurV5(this).rollWrestle(...args);
    }

    aim(...args) {
        return new ActeurV5(this).aim(...args);
    }

    reload(...args) {
        return new ActeurV5(this).reload(...args);
    }

    getUp(...args) {
        return new ActeurV5(this).getUp(...args);
    }

}