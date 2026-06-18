import { Chute } from "../../feature/periode/chute.js";
import { CombatantMixinSheet } from "../../module/common/combatantSheetMixin.js";
import { Constants } from "../../module/common/constants.js";
import { FeatureBuilder } from "../../feature/core/featureBuilder.js";
import { Game } from "../../module/common/game.js";
import { HistoricalSheet } from "../../module/actor/historical.js";
import { NephilimActorSheet } from "../../module/actor/nephilimActorSheet.js";
import { OptionsSelector } from "./optionsSelector.js";
import { Science } from "../../feature/science/science.js";


export class FigureSheet extends CombatantMixinSheet(HistoricalSheet) {

    static DEFAULT_OPTIONS = {
        position: {
            width: 1070,
            height: 950
        },
        actions: {
            openItem: FigureSheet._onOpenItem,
            roll: FigureSheet._onRollItem,
            changeFocus: FigureSheet._onChangeFocus,
            changeStatus: FigureSheet._onChangeStatus,
            changePacte: FigureSheet._onChangePacte,
            selectLaboratory: FigureSheet._onSelectLaboratory,
            deleteLaboratory: FigureSheet._onDeleteLaboratory,
            construct: FigureSheet._onConstruct
        },
        dropHandlers: {
            magie: FigureSheet._onDropScience,
            sort: FigureSheet._onDropFocus,
            invocation: FigureSheet._onDropFocus,
            formule: FigureSheet._onDropFocus
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/figure/figure.html`,
        }
    }

    static TABS = {
        primary: {
            tabs: [
                { id: "description", template: `systems/neph5e/feature/figure/description.hbs` }
            ],
            initial: "description"
        }
    }

    /**
     * @constructor
     * @param args
     */
    constructor(...args) {
        super(...args);
        this.editedCapacity = null;
    }

    /**
     * @override
     **/
    _getTabsConfig(group) {
        if (group !== "primary") return super._getTabsConfig(group);
        const tabs = [{
            id: "description",
            template: `systems/neph5e/feature/figure/description.hbs`
        }];
        const o = this.document.system.options ?? {};
        if (o.combat) {
            tabs.push({
                id: "combat",
                template: `systems/neph5e/feature/figure/combat.hbs`
            });
        }
        if (o.incarnations) {
            tabs.push({
                id: "incarnations",
                template: `systems/neph5e/feature/figure/incarnations.hbs`,
                from: "figure"
            });
        }
        if (o.vecus) {
            tabs.push({
                id: "vecus",
                template: `systems/neph5e/feature/figure/vecus.hbs`,
                from: "figure"
            });
        }
        if (o.magie) {
            tabs.push({
                id: "magie",
                template: `systems/neph5e/feature/science/actor/science.hbs`,
                science: "magie",
                header: Science._getHeader("magie")
            });
        }
        if (o.kabbale) {
            tabs.push({
                id: "kabbale",
                template: `systems/neph5e/feature/science/actor/science.hbs`,
                science: "kabbale",
                header: Science._getHeader("kabbale")
            });
        }
        if (o.alchimie) {
            tabs.push({
                id: "alchimie",
                template: `systems/neph5e/feature/science/actor/science.hbs`,
                science: "alchimie",
                header: Science._getHeader("alchimie")
            });
            tabs.push({
                id: "laboratoire",
                template: `systems/neph5e/feature/alchimie/actor/laboratoire.hbs`,
                cercles: Game.alchimie.cercles
            });
        }
        return { tabs, initial: "description" };
    }

    async setOptions(options) {
        await this.document.update({
            'system.options.theme': options.theme,
            'system.options.nephilim': options.nephilim,
            'system.options.magie': options.magie,
            'system.options.analogie': options.analogie,
            'system.options.kabbale': options.kabbale,
            'system.options.alchimie': options.alchimie,
            'system.options.dracomachie': options.dracomachie,
            'system.options.selenim': options.selenim,
            'system.options.necromancie': options.necromancie,
            'system.options.conjuration': options.conjuration,
            'system.options.luneNoire': options.luneNoire,
            'system.options.baton': options.baton,
            'system.options.coupe': options.coupe,
            'system.options.denier': options.denier,
            'system.options.epee': options.epee,
            'system.options.gestionLaboratoire': options.gestionLaboratoire,
            'system.options.daath': options.daath,
            'system.options.degatAutomatique': options.degatAutomatique,
            'system.options.defenseMJ': options.defenseMJ,
            'system.options.vecus': options.vecus,
            'system.options.incarnations': options.incarnations,
            'system.options.combat': options.combat,
            'system.options.capacites': options.capacites,
            'system.options.simulacre': options.simulacre,
            'system.options.soleil': options.soleil,
            'system.options.akasha': options.akasha,
            'system.options.fraternites': options.fraternites,
            'system.options.atlanteide': options.atlanteide,
            'system.options.bohemien': options.bohemien,
            'system.options.chronologieDescendante': options.chronologieDescendante,
            'system.options.degreGauche': options.degreGauche,
            'system.options.incarnationsOuvertes': options.incarnationsOuvertes
        });
        this.elapsedPeriodes = this._elapsedPeriodes();
        await this.render(true);
    }

    /**
     * @override
     */
    get setupable() {
        return true;
    }

    /**
     * @override
     */
    async _onSetup(event, target) {
        await new OptionsSelector()
            .withSheet(this)
            .render(true);
    }

    /** @override */
    async _onRender(context, options) {
        await super._onRender(context, options);
        for (const el of this.element.querySelectorAll('.focus-quantite')) {
            el.addEventListener('change', this._onChangeQuantite.bind(this));
        }
        for (const el of this.element.querySelectorAll('.focus-transporte')) {
            el.addEventListener('change', this._onChangeTransporte.bind(this));
        }
    }



    // Roll combat
    async _onRoll(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const arme = this.actor.items.get(id);
        const uuid = arme.system.competence;
        const skill = game.items.find(i => i.sid === uuid);
        if (skill === undefined) {
            ui.notifications.warn(game.i18n.localize('NEPH5E.noWeaponSkill'));
        } else {
            return await skill.roll(this.actor);
        }
    }

    /**
     * Set the specified metamorphose to be formed or not.
     * @param property The property to toggle, formed or visible.
     * @param event The click event.
     */
    async _onToggleMetamorphose(property, event) {
        event.preventDefault();
        if (this.actor.locked) return;
        const id = $(event.currentTarget).closest(".metamorphose").data("id");
        const item = game.items.get(id);
        const index = $(event.currentTarget).closest(".metamorphose").data("index");
        const feature = new FeatureBuilder(this.actor).withOriginalItem(item.sid).create()
        switch (property) {
            case 'formed':
                await feature.toggleFormed(index);
                return;
            case 'visible':
                await feature.toggleVisible(index);
                return;
        }  
    }

    /**
     * Set the degre of the specified chute.
     * @param type  The type of chute to update: khaiba, narcose, ombre, luneNoire.
     * @param event The click event.
     */
    async _onChute(type, event) {
        event.preventDefault();
        if (!this.actor.locked && this.actor.system.periode != null) {
            await new Chute(this.actor).set(type, $(event.currentTarget).closest("." + type).data("id"));
        }
    }

    /**
     * Active the specified laboratory.
     * @param event The click event.
     */
    async _onActiveLaboratory(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".actor");
        const sid = li.data("actor-id");
        const actor = game.actors.find(i => i.sid === sid);
        if (actor != null) {
            await this.actor.update({ ['system.alchimie.courant']: this.actor.system.alchimie.courant === actor.sid ? null : actor.sid});
        }
    }

    /**
     * Set the specified aspect of the imago to be active or not.
     * @param event The click event.
     */
    async _onToggleAspect(event) {
        event.preventDefault();
        if (this.actor.locked) return;
        const sid = $(event.currentTarget).closest(".item").data("sid");
        await new FeatureBuilder(this.actor).withOriginalItem(sid).create().toggleActive();
    }

    /**
     * Roll the specified ka.
     * @param event The click event.
     */
    async _onRollKa(event) {
        event.preventDefault();
        const element = $(event.currentTarget).closest('.element').data('id');
        const feature = new FeatureBuilder(this.actor).withScope('actor').withKa(element).create();
        await feature.initializeRoll();
        return this;
    }


    /** Construit la feature à partir de l'élément cliqué (AppV2). */
    _featureFromTarget(target) {
        const node = target.closest('.item');
        const id = node.dataset.id;
        const sid = node.dataset.sid;
        const scope = node.dataset.scope ?? "actor";
        return new FeatureBuilder(this.document)
            .withScope(scope)
            .withEmbeddedItem(id)
            .withOriginalItem(sid)
            .create();
    }

    /** Ouvre la fiche de l'item (vécu, savoir, quête, compétence...). */
    static async _onOpenItem(event, target) {
        const feature = this._featureFromTarget(target);
        await feature.editEmbeddedItem();
    }

    /** Lance le jet de l'item. */
    static async _onRollItem(event, target) {
        const feature = this._featureFromTarget(target);
        await feature.initializeRoll();
    }

    /**
     * Set the number of vaisseaux alchimiques.
     * Used by:
     *  - formule
     * @param event The click event.
     */
    async _onChangeQuantite(event) {
        if (this.locked) return;
        const sid = event.target.closest('.item').dataset.sid;
        const item = this.document.items.find(i => i.sid === sid);
        await item.update({ ['system.quantite']: parseInt(event.target.value) });
    }

    /**
     * Set the number of vaisseaux alchimiques.
     * Used by:
     *  - formule
     * @param event The click event.
     */
    async _onChangeTransporte(event) {
        if (this.locked) return;
        const sid = event.target.closest('.item').dataset.sid;
        const item = this.document.items.find(i => i.sid === sid);
        await item.update({ ['system.transporte']: parseInt(event.target.value) });
    }

    /**
     * Set the pacte of the item.
     * Used by:
     *  - invocation
     * @param event The click event.
     */
    /** Toggle le pacte de l'invocation. */
    static async _onChangePacte(event, target) {
        if (this.locked) return;
        const sid = target.closest('.item').dataset.sid;
        const item = this.document.items.find(i => i.sid === sid);
        await item.update({ ['system.pacte']: !item.system.pacte });
    }

    /**
     * Set the focus of the item.
     * Used by:
     *  - sort
     *  - invocation
     *  - formule
     *  - rite
     *  - appel
     * @param event The click event.
     */
    /** Toggle la possession du focus (icône parchemin). */
    static async _onChangeFocus(event, target) {
        if (this.locked) return;
        const sid = target.closest('.item').dataset.sid;
        const item = this.document.items.find(i => i.sid === sid);
        await item.update({ ['system.focus']: !item.system.focus });
    }

    /**
     * Changes the status of the item.
     *  - If the item was connu, it becomes dechiffre. 
     *  - If the item was dechiffre, it becomes appris.
     *  - If the item was appris, it becomes tatoue.
     *  - If the item was tatoue, it becomes connu.
     * Used by:
     *  - sort
     *  - invocation
     *  - formule
     *  - rite
     *  - appel
     * @param event The click event.
     */
    /** Cycle le statut : connu → déchiffré → appris → tatoué → connu. */
    static async _onChangeStatus(event, target) {
        if (this.locked) return;
        const sid = target.closest('.item').dataset.sid;
        const item = this.document.items.find(i => i.sid === sid);
        switch (item.system.status) {
            case Constants.CONNU:     await item.update({ ['system.status']: Constants.DECHIFFRE }); break;
            case Constants.DECHIFFRE: await item.update({ ['system.status']: Constants.APPRIS });   break;
            case Constants.APPRIS:    await item.update({ ['system.status']: Constants.TATOUE });    break;
            case Constants.TATOUE:    await item.update({ ['system.status']: Constants.CONNU });     break;
            default: throw new Error("Status " + item.system.status + " not implemented");
        }
    }


    /** Drop d'une voie de science (magie, kabbale, ...) : embarque la voie. */
    static async _onDropScience(event, document) {
        await new FeatureBuilder(this.document)
            .withOriginalItem(document.sid)
            .create()
            .drop();
        await this.render(true);
    }

    /** Drop d'un focus (sort, ...) : rattaché à la période courante.
     *  Si le focus existait déjà sur une autre période, il est déplacé (une seule période). */
    static async _onDropFocus(event, document) {
        await new FeatureBuilder(this.document)
            .withOriginalItem(document.sid)
            .withPeriode(this.document.system.periode)
            .create()
            .drop();
        await this.render(true);
    }

    /**
     * Toggle the state of the specified vaisseau used to travel.
     * @param event The click event.
     */
    async _onToggleVaisseau(event) {
        event.preventDefault();
        if (this.actor.locked) return;
        const vaisseau = $(event.currentTarget).closest('.vaisseau').data('type');
        const activated = this.actor.system.akasha[vaisseau].active;
        await this.actor.update({ ['system.akasha.' + vaisseau + ".active"]: !activated });
    }

    /**
     * Edit or unedit the specified capacity.
     * @param capacity The capacity to edit, 'esquive' or 'lutte'
     * @param event The click event.
     */
    async _onEditCapacity(capacity, event) {
        event.preventDefault();
        this.editedCapacity = this.editedCapacity === capacity ? null : capacity;
        await this.render(true);
    }

    /** Active/désactive un construct (seulement sur son propre labo, déverrouillé). */
    static async _onConstruct(event, target) {
        if (this.document.system.alchimie.courant == null && this.locked === false) {
            const construct = target.closest('.tooltip').dataset.type;
            const activated = this.document.system.alchimie.constructs[construct].active;
            await this.document.update({ ['system.alchimie.constructs.' + construct + ".active"]: !activated });
        }
    }

    /** Sélectionne un laboratoire (le sien si pas de data-sid). */
    static async _onSelectLaboratory(event, target) {
        const sid = target.dataset.sid;
        await this.document.update({ ['system.alchimie.courant']: sid == null ? null : sid });
    }

    /** Supprime le laboratoire courant. */
    static async _onDeleteLaboratory(event, target) {
        const sid = this.document.system.alchimie.courant;
        const labs = this.document.system.alchimie.laboratoires.filter(i => i !== sid);
        await this.document.update({ ['system.alchimie.laboratoires']: labs });
        await this.document.update({ ['system.alchimie.courant']: null });
    }

    /**
     * Set the number of materiae.
     * @param event The click event.
     */
    async _onChangeMateriae(event) {
        event.preventDefault();
        if (this.actor.locked) return;
        const sid = $(event.currentTarget).closest('.item').data('sid');
        const item = this.actor.items.find(i => i.sid === sid);
        const value = $(event.currentTarget).closest(".quantite").val();
        await item.update({ ['system.quantite']: parseInt(value) });
    }

}