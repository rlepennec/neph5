import { Arcane } from "../../../../feature/arcane/regles/v5/arcane.js";
import { IncarnationsV5 } from "../../../../feature/incarnation/regles/v5/incarnations.js";
import { Version } from "../../../../module/common/version.js";
import { Aspect } from "../../../../feature/selenim/regles/v5/aspect.js";
import { Capacite } from "../../../../feature/capacite/regles/v5/capacite.js";
import { Catalyseur } from "../../../../feature/alchimie/regles/v5/catalyseur.js";
import { Chute } from "../../../../feature/chute/regles/v5/chute.js";
import { Competence } from "../../../../feature/competence/regles/v5/competence.js";
import { Constants } from "../../../common/regles/v5/constants.js";
import { ActiveEffects } from "../../../../feature/core/regles/v5/effects.js";
import { FeatureBuilder } from "../../../../feature/core/regles/v5/featureBuilder.js";
import { Fraternite } from "../../../../feature/fraternite/regles/v5/fraternite.js";
import { Laboratoire } from "../../../../feature/alchimie/regles/v5/laboratoire.js";
import { Materiae } from "../../../../feature/alchimie/regles/v5/materiae.js";
import { Metamorphe } from "../../../../feature/nephilim/regles/v5/metamorphe.js";
import { Ordonnance } from "../../../../feature/kabbale/regles/v5/ordonnance.js";
import { Savoir } from "../../../../feature/savoir/regles/v5/savoir.js";
import { Science } from "../../../../feature/science/regles/v5/science.js";
import { Vecu } from "../../../../feature/vecu/regles/v5/vecu.js";
import { CombatantMixin } from "./combatantMixin.js";

/**
 * Ce que les règles v5 savent d'un acteur (voir Regles) : ses caractéristiques, ses Ka, ses listes
 * d'objets, ses jets et, par CombatantMixin, son combat. Rien de cela n'est une notion commune : une
 * autre version de règles peut n'avoir ni Ka, ni sciences, ni combat.
 *
 * L'objet est fait pour être utilisé sur le champ, puis jeté : il ne garde rien, et s'en remet à
 * l'acteur pour tout ce qui est propre au document.
 */
class Acteur {

    /**
     * @param actor The actor.
     */
    constructor(actor) {
        this.actor = actor;
    }

}

export class ActeurV5 extends CombatantMixin(Acteur) {

    /**
     * Une caractéristique de la figure, tirée de ses Ka selon sa nature : Nephilim, Selenim
     * ou ni l'un ni l'autre. 0 pour un autre acteur.
     * @param nephilim Le calcul d'un Nephilim, depuis ses Ka.
     * @param selenim  Celui d'un Selenim.
     * @param autre    Celui d'une figure qui n'est ni l'un ni l'autre.
     * @returns the value.
     */
    _selonNature(nephilim, selenim, autre) {
        if (this.actor.type !== 'figure') return 0;
        const options = Version.data(this.actor).options;
        if (options?.nephilim === true) return nephilim(this.kas);
        if (options?.selenim === true) return selenim(this.kas);
        return autre(this.kas);
    }

    /**
     * @returns the actor mouvement.
     */
    get mouvement() {
        return this._selonNature(kas => kas.eau * 2, kas => kas.noyau, kas => kas.soleil ?? 0);
    }

    /**
     * @returns the actor perspicacite.
     */
    get perspicacite() {
        return this._selonNature(kas => 11 - kas.air, kas => 11 - kas.noyau, kas => 11 - (kas.soleil ?? 0));
    }

    /**
     * @returns the actor recuperation.
     */
    get recuperation() {
        return this._selonNature(kas => 11 - kas.terre, kas => 11 - kas.noyau, kas => 11 - kas.soleil);
    }

    /**
     * @returns the actor voile.
     */
    get voile() {
        return this._selonNature(kas => Math.floor(kas.lune / 5), kas => Math.floor(kas.noyau / 10), kas => Math.floor((kas.soleil ?? 0) / 10));
    }

    /**
     * Une lecture d'un bloc que porte l'incarnation courante d'une figure ; un autre acteur
     * porte le sien.
     * @param lecture La méthode d'IncarnationsV5 qui lit le bloc ('kas', 'alchimie'...).
     * @param champ   Le champ de l'acteur qui le porte sinon ('ka', 'alchimie'...).
     * @returns the block.
     */
    _selonIncarnation(lecture, champ) {
        const incarnations = new IncarnationsV5(this.actor);
        return incarnations.porte ? incarnations[lecture]() : Version.data(this.actor)[champ];
    }

    /**
     * Les Ka de l'acteur. Ceux d'une figure sont portés par son incarnation courante (voir
     * IncarnationsV5.kas), chacun indépendant de ceux des autres époques ; un figurant a son Ka
     * unique. Toutes les lectures de Ka passent par ici.
     * @returns the Ka object of a figure, the single Ka of a figurant.
     */
    get kas() {
        return this._selonIncarnation('kas', 'ka');
    }

    /**
     * Le laboratoire de l'acteur (constructs, materiae primae, laboratoires accessibles,
     * laboratoire courant). Celui d'une figure est porté par son incarnation courante (voir
     * IncarnationsV5.alchimie). Toutes les lectures du laboratoire passent par ici.
     * @returns the laboratory object.
     */
    get alchimie() {
        return this._selonIncarnation('alchimie', 'alchimie');
    }

    /**
     * Les voyages akashiques de l'acteur (nef, barge, boussole, compas). Ceux d'une figure sont
     * portés par son incarnation courante (voir IncarnationsV5.akasha).
     * @returns the akasha object.
     */
    get akasha() {
        return this._selonIncarnation('akasha', 'akasha');
    }

    /**
     * Les blessures de l'acteur (cases physiques et magiques). Celles d'une figure sont portées
     * par son incarnation courante (voir IncarnationsV5.blessures) ; un figurant porte les
     * siennes. Toutes les lectures de blessures passent par ici.
     * @returns { physique, magique }.
     */
    get blessures() {
        return this._selonIncarnation('blessures', 'dommage');
    }

    /**
     * Écrit des blessures : dans l'incarnation courante d'une figure, sur un figurant sinon.
     * @param valeurs Les valeurs, par chemin dans les blessures (ex: { 'physique._1': true }).
     * @returns false if a figure has no current incarnation.
     */
    async ecrireBlessures(valeurs) {
        const incarnations = new IncarnationsV5(this.actor);
        if (incarnations.porte) return incarnations.ecrireBlessures(valeurs);
        const update = {};
        for (const [chemin, valeur] of Object.entries(valeurs)) {
            update[Version.path(this.actor, 'dommage') + '.' + chemin] = valeur;
        }
        await this.actor.update(update);
        return true;
    }

    /**
     * Les bonus de l'acteur (mouvement, initiative, dommage, protection). Ceux d'une figure sont
     * portés par son incarnation courante (voir IncarnationsV5.bonus) ; un figurant porte les siens.
     * Toutes les lectures de bonus passent par ici.
     * @returns the bonus object.
     */
    get bonus() {
        return this._selonIncarnation('bonus', 'bonus');
    }

    /**
     * @returns the actor ka dominant.
     */
    get ka() {
        if (this.actor.type === 'figurant') return this.kas;
        return this._selonNature(
            kas => Math.max(kas.air, kas.eau, kas.feu, kas.lune, kas.terre),
            kas => kas.noyau,
            () => 0);
    }

    /**
     * @returns the voie magique of the actor.
     */
    get voieMagique() {
        // Celle de l'incarnation courante, sinon de l'antérieure la plus proche
        return new IncarnationsV5(this.actor).voie('magie');
    }

    /**
     * @returns the voie alchimique of the actor.
     */
    get voieAlchimique() {
        // Celle de l'incarnation courante, sinon de l'antérieure la plus proche
        return new IncarnationsV5(this.actor).voie('alchimie');
    }

    /**
     * @returns the data to display. 
     */
    get arcanes() {
        return Arcane.getAll(this.actor);
    }

    /**
     * @returns the data to display. 
     */
    get capacites() {
        return Capacite.getAll(this.actor);
    }

    /**
     * @returns the data to display. 
     */
    get catalyseurs() {
        return Catalyseur.getAll(this.actor);
    }

    /**
     * @returns the data to display. 
     */
    get chutes() {
        return FeatureBuilder.getAll(this.actor, 'chute');
    }

    /**
     * @returns the current chute
     */
    get khaiba() {
        return Chute.getKhaiba(this.actor);
    }

    /**
     * @returns the current chute
     */
    get narcose() {
        return Chute.getNarcose(this.actor);
    }

    /**
     * @returns the current chute
     */
    get ombre() {
        return Chute.getOmbre(this.actor);
    }

    /**
     * @returns the current chute
     */
    get luneNoire() {
        return Chute.getLuneNoire(this.actor);
    }

    /**
     * @returns the data to display. 
     */
    get competences() {
        return Competence.getAll(this.actor);
    }

    /**
     * @returns the data to display. 
     */
    get imago() {
        return Aspect.getAll(this.actor);
    }

    /**
     * @returns the data to display. 
     */
    get metamorphe() {
        return Metamorphe.getAll(this.actor);
    }

    /**
     * @returns the data to display. 
     */
    get ordonnances() {
        return Ordonnance.getAll(this.actor);
    }

    /**
     * @returns the data to display. 
     */
    get materiae() {
        return Materiae.getAll(this.actor);
    }

    /**
     * @returns the data to display. 
     */
    get passes() {
        return FeatureBuilder.getAll(this.actor, 'passe');
    }

    /**
     * @returns the data to display. 
     */
    get periodes() {
        return new IncarnationsV5(this.actor).chronologie();
    }

    /**
     * @returns the data to display. 
     */
    get quetes() {
        return FeatureBuilder.getAll(this.actor, 'quete');
    }

    /**
     * @returns the data to display. 
     */
    get savoirs() {
        return FeatureBuilder.getAll(this.actor, 'savoir');
    }

    /**
     * @returns the data to display. 
     */
    get sciences() {
        return FeatureBuilder.getAll(this.actor, 'science');
    }

    /**
     * @returns the data to display. 
     */
    get vecusOfActor() {
        return Vecu.getAll(this.actor, 'actor');
    }

    /**
     * @returns the data to display. 
     */
    get vecusOfSimulacre() {
        return Vecu.getAll(this.actor, 'simulacre');
    }

    /**
     * @param sid The system identifier of the item for which to retrieve the degre of the fraternite.
     * @returns the fraternite degre for the specified item.
     */
    fraternite(sid) {
        let degre = 0;
        if (Version.data(this.actor).options?.fraternites === true) {
            for (let f of this.fraternites.filter(a => Version.data(a).options.active === true)) {
                const d = new FeatureBuilder(f).withOriginalItem(sid).create().degre;
                if (d != null && d > degre) {
                    degre = d;
                }
            }
        }
        return degre;
    }

    /**
     * @param science The name of the science.
     * @returns true if some focus are owned.
     */
    numberOfFocus(science) {
        return this.focus(science).length;
    }

    /**
     * @param science The key of the science.
     * @returns the level of the science.
     */
    science(science) {
        const i = Science.getScience(science);
        return new Science(this.actor).withItem(i).degre;
    }

    /**
     * @param savoir The key of the savoir.
     * @returns the level of the savoir.
     */
    savoir(savoir) {

        let item = null;
        switch (savoir) {
            case "denier": {
                item = game.items.find(i => i.sid === "2e59bafc-c15ad33f-ecf2b0b5-552ae23e");
                break;
            }
            case "coupe": {
                item = game.items.find(i => i.sid === "1ca3f53b-b487e304-2260922e-b9d29476");
                break;
            }
            case "epee": {
                item = game.items.find(i => i.sid === "6d3727df-99a5a34a-cd599572-c9d755dd");
                break;
            }
            case "baton": {
                item = game.items.find(i => i.sid === "83a3e42e-5af77cbd-df0f4d7c-38dd775d");
                break;
            }
            case "bohemien": {
                item = game.items.find(i => i.sid === "0168fa19-a6141d9e-65eaa5b4-d6e9dcb1");
                break;
            }
        }

        return item == null ? null : new Savoir(this.actor).withItem(item);

    }

    /**
     * @param science The type 'sort', 'formule' etc...
     * @param options The option parameters:
     *   - all: if true, all cercles are returned.
     * @returns the information datas about the specified cercles.
     */
    cercles(science, options) {
        return Science.cercles(this.actor, science, options);
    }

    /**
     * @param science The name of the science.
     * @returns the owned focus of the actor. 
     */
    focus(science) {
        return Science.getFocus(this.actor, science);
    }

    /**
     * @returns the actor laboratories.
     */
    get laboratoires() {
        return Laboratoire.getAll(this.actor);
    }

    /**
     * @returns the fraternites objects in which the actor is member.
     */
    get fraternites() {
        const fraternites = [];
        for (let f of game.actors.filter(a => a.type === 'fraternite')) {
            if (new Fraternite(f).isActiveMember(this.actor)) {
                fraternites.push(f);
            }
        }
        return fraternites;
    }

    /**
     * @returns the members of the fraternite sorted by status.
     */
    get membres() {
        return new Fraternite(this.actor).membres();
    }

    /**
     * @param actor   The actor identifier.
     * @param periode The periode system identifier.
     * @returns true if new member for the periode (in), false is out
     */
    isNewMember(actor, periode) {
        return new Fraternite(this.actor).isNewMember(actor, periode);
    }

    /**
     * Create the specified feature.
     * @param type The type of macro which can be 
     *   - ka      with id in [air, eau, feu, lune, terre, soleil, ka]
     *   - item    with sid
     *   - wrestle without id or sid
     *   - 
     * 
     *   - chute
     *   - competence
     *   - ka 
     *      * element [air, eau, feu, lune, terre, soleil, ka]
     *   - noyau
     *   - passe
     *   - pavane
     *   - quete
     *   - savoir
     *   - science
     *   - vecu
     * @param id  The object identifier
     * @param sid The object system identifier.
     * @returns the instance.
     */
    async processMacro(type, id, sid) {
        let builder = null;
        switch (type) {

            case 'item': {
                builder = new FeatureBuilder(this.actor)
                    .withOriginalItem(sid)
                    .withScope('actor')
                    .withPeriode(new IncarnationsV5(this.actor).courante);
                break;
            }

            case 'vecu': {
                builder = new FeatureBuilder(this.actor)
                    .withEmbeddedItem(id)
                    .withScope(this.actor.items.get(id) != null ? 'actor' : 'simulacre')
                    .withPeriode(new IncarnationsV5(this.actor).courante);
                break;
            }

            case 'ka': {
                builder = new FeatureBuilder(this.actor)
                    .withKa(id)
                    .withScope('actor');
                break;
            }

            case 'noyau': {
                builder = new FeatureBuilder(this.actor)
                    .withNoyau();
                break;
            }

            case 'pavane': {
                builder = new FeatureBuilder(this.actor)
                    .withPavane();
                break;
            }

            case 'weapon': {
                const weapon = this.actor.items.get(id);
                if (weapon == null) {
                    ui.notifications.warn("Vous ne possédez pas cette arme pour attaquer.");
                    return;
                }
                await this.rollWeapon(weapon, this.combatant);
                break;
            }

            case 'wrestle':
                await this.rollWrestle(this.combatant);
                break;

        }

        if (builder != null) {
            const feature = builder.create();
            if (feature != null) {
                await feature.initializeRoll();
            }
        }

    }

    /**
     * @param element The element for which to retrieve to max MP.
     * @returns the maximum number of materiae primae.
     */
    getMaxBaseMP(element) {
        return new Laboratoire(this.actor).getMaxBaseMP(element);
    }

    /**
     * Gets the construct associated with the specified substance.
     * @param substance The substance of the construct to get.
     * @return the construct.
     */
    getConstruct(substance) {
        return new Laboratoire(this.actor).getConstruct(substance);
    }

    /**
     * @returns the allowed approches with the label of the element and the value if > 0.
     *
     * La clef de chaque entrée est le nom du ka dans le schéma — 'noyau', 'air',
     * 'ka' — et c'est elle, et elle seule, qui identifie l'approche : c'est
     * l'argument attendu par getKa(). Les gabarits l'émettent en valeur d'option.
     *
     * Le champ 'name' portait auparavant un chemin i18n ('NEPHILIM.luneNoire')
     * qui servait aussi de valeur d'option, ce qui mélangeait identité et
     * affichage. Comme il ne coïncidait pas toujours avec la clef, l'approche
     * de noyau d'un sélénim était résolue en getKa('luneNoire') — champ
     * inexistant, donc bonus nul. Le champ est supprimé : le libellé traduit
     * suffit à l'affichage, la clef suffit à l'identité.
     *
     * Un champ 'degre' recopiait par ailleurs le niveau du ka dans chaque
     * entrée, sans qu'aucun lecteur ne s'en serve : le bonus est recalculé
     * depuis la clef par actionDialog._approche(), via getKa(). Cette copie
     * muette est supprimée — deux sources pour une même valeur finissent par
     * diverger.
     */
    approches() {
        const approches = {};
        approches['none'] = {
            label: game.i18n.localize('NEPHILIM.aucuneApproche')
        };
        switch (this.actor.type) {
            case 'figure':
                if (Version.data(this.actor).options.selenim === true) {
                    if (this.kas.noyau > 0) {
                        approches['noyau'] = {
                            label: ActeurV5.libelleApproche('luneNoire')
                        };
                    }
                }
                if (Version.data(this.actor).options.nephilim === true) {
                    // NEPHILIM porte déjà les mêmes libellés d'élément que
                    // l'ancien bloc NEPH5E.pentacle.elements, à l'identique.
                    for (let elt of Constants.ELEMENTS) {
                        if (this.kas[elt] > 0) {
                            approches[elt] = {
                                label: ActeurV5.libelleApproche(elt)
                            };
                        }
                    }
                }
                break;
            case 'figurant':
                approches['ka'] = {
                    label: ActeurV5.libelleApproche('ka')
                };
                break;
        }
        return approches;
    }

    /**
     * Le libellé d'une approche était construit en concaténant la chaîne
     * française 'Approche de ' au nom traduit du ka : le système n'était donc
     * pas traduisible sur ce point. La phrase entière vit désormais dans
     * NEPHILIM.approcheDe, avec le ka en paramètre.
     *
     * @param ka Le nom du ka, tel qu'il sert de clef dans NEPHILIM.
     * @returns le libellé affiché dans la liste des approches.
     */
    static libelleApproche(ka) {
        return game.i18n.localize('NEPHILIM.approcheDe' + ka.charAt(0).toUpperCase() + ka.slice(1));
    }

    /**
     * Gets the level of the specified ka.
     * @param element The element of the ka to get. Allowed ka are:
     *   air,
     *   brume,
     *   eau,
     *   feu,
     *   lune,
     *   noyau,
     *   orichalque,
     *   reserve,
     *   soleil,
     *   terre
     * @returns the level of the specified ka.
     */
    getKa(element) {
        switch (this.actor.type) {
            case 'figure':
                return this.kas[element] ?? 0;
            case 'figurant':
                return this.kas;
        }
    }

    /**
     * Deletes the specified vecu, used as callback.
     * @param item The original or embedded vecu item to delete.
     */
    async deleteVecu(item) {
        const embedded = this.actor.items.find(i => i.sid === item.sid);
        if (embedded != null) {
            await new Vecu(this.actor, 'actor').withItem(embedded).delete();
        }
    }

    /**
     * Deletes the specified competence, used as callback.
     * @param item The competence item object to delete.
     */
    async deleteCompetence(item) {
        await new Competence(this.actor, item).delete();
    }

    /**
     * Ouvre une copie embarquée comme la fiche du personnage l'ouvre (voir
     * FicheActeurV5._onOpenLink) : selon la fonctionnalité, la fiche de l'item du monde avec les
     * données du personnage. Si l'item à ouvrir n'est pas lisible par l'utilisateur, rien.
     * @param item The embedded item.
     * @returns true if opened.
     */
    async ouvrirObjet(item) {
        const feature = new FeatureBuilder(this.actor)
            .withScope("actor")
            .withEmbeddedItem(item.id)
            .withOriginalItem(item.sid)
            .create();
        if (feature == null || feature.openingItem()?.sheet?.isVisible === false) return false;
        await feature.editEmbeddedItem();
        return true;
    }

    /**
     * Supprime un objet embarqué de la fiche : un vécu ou une compétence emporte ce qui en
     * dépend, les autres partent seuls.
     * @param item The embedded item to delete.
     */
    async supprimerObjet(item) {
        switch (item.type) {
            case 'vecu':
                await this.deleteVecu(item);
                break;
            case 'competence':
                await this.deleteCompetence(item);
                break;
            default:
                await this.actor.deleteEmbeddedDocuments('Item', [item.id]);
                break;
        }
    }

    /**
     * Retire des acteurs supprimés du monde de l'effectif de cette fraternité.
     * @param sids The system identifiers of the deleted actors.
     */
    async acteursSupprimes(sids) {
        if (this.actor.type === 'fraternite') {
            await new Fraternite(this.actor).onDeleteActors(sids);
        }
    }

    /**
     * Bascule un état depuis le HUD du jeton ou le suivi de combat. Ceux d'une figure sont
     * portés par son incarnation courante (voir ActiveEffects.porteur) : sans elle, aucun.
     * Même logique que celle de Foundry, sur l'incarnation au lieu de l'acteur ; un token non lié
     * ignore en plus les états de son acteur (voir EffetsV5).
     * @param statusId  The status identifier.
     * @param options   { active, overlay }, as Actor#toggleStatusEffect.
     * @param parDefaut The logic of Foundry, on the actor.
     */
    async basculerEtat(statusId, { active, overlay = false } = {}, parDefaut) {
        const actor = this.actor;
        const porteur = ActiveEffects.porteur(actor);
        if (porteur === actor && !actor.isToken) return parDefaut();
        if (porteur == null) return;
        const status = CONFIG.statusEffects[statusId];
        if (!status) throw new Error(`Invalid status ID "${statusId}" provided to Actor#toggleStatusEffect`);

        // Les effets de cet état déjà portés, hors ceux hérités de l'acteur d'un token non lié
        const existing = status._id
            ? [porteur.effects.get(status._id)].filter(e => e != null && !ActiveEffects.herite(e)).map(e => e.id)
            : porteur.effects.filter(e => e.statuses.size === 1 && e.statuses.has(status.id) && !ActiveEffects.herite(e)).map(e => e.id);
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
     * de ses jetons sont redessinées.
     * @param changed The changed data of the actor.
     */
    apresModification(changed) {
        if (foundry.utils.getProperty(changed, 'system.periode') !== undefined) {
            for (const token of this.actor.getActiveTokens()) token.drawEffects();
        }
    }

    /**
     * Le jet d'un passé.
     *
     * Le passé peut arriver sous sa forme embarquée — c'est ce que la fiche a
     * sous la main — ou comme item du monde. Les deux voies convergent :
     * HistoricalFeature.withEmbeddedItem repose this.item sur l'item du monde
     * retrouvé par sid, et le degré vient de degreFromPeriodes(sid).
     *
     * @param item Le passé, embarqué ou item du monde. Ne doit pas être null,
     *             l'appelant s'en assure.
     */
    async rollPasse(item) {

        const builder = new FeatureBuilder(this.actor).withScope('actor');
        const feature = (item.isEmbedded
            ? builder.withEmbeddedItem(item.id)
            : builder.withOriginalItem(item.sid)).create();

        if (feature == null) {
            ui.notifications.error("Le passé est introuvable");
            return;
        }

        // La feature peut exister sans son item du monde : withEmbeddedItem le
        // retrouve par sid et rend undefined pour un embarqué ORPHELIN. data lit
        // alors this.item.name et lèverait, après le contrôle ci-dessus.
        if (feature.item == null) {
            ui.notifications.error("Le passé « " + item.name + " » ne correspond à aucun item du monde");
            return;
        }

        await feature.initializeRoll();
    }

}
