import { Chute } from "../../feature/periode/chute.js";
import { Constants } from "../common/constants.js";
import { FeatureBuilder } from "../../feature/core/featureBuilder.js";
import { Game } from "../common/game.js";
import { HistoricalSheet } from "./historical.js";

export class FigureSheet extends HistoricalSheet {

    /**
     * @constructor
     * @param args
     */
    constructor(...args) {
        super(...args);
        this.editedCapacity = null;
    }

    /**
     * @return the path of the specified actor sheet.
     */
    get template() {
        return 'systems/neph5e/templates/actor/figure.html';
    }

    /**
     * @override
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 1070,
            height: 950,
            classes: ["nephilim", "sheet", "actor" ],
            resizable: true,
            scrollY: [
                ".tab.description",
                ".tab.vecus",
                ".tab.nephilim",
                ".tab.magie",
                ".tab.analogie",
                ".tab.kabbale",
                ".tab.alchimie",
                ".tab.laboratoire",
                ".tab.akasha",
                ".tab.selenim",
                ".tab.necromancie",
                ".tab.conjuration",
                ".tab.baton",
                ".tab.coupe",
                ".tab.denier",
                ".tab.epee",
                ".tab.incarnations",
                ".tab.options"],
            tabs: [
                {
                    navSelector: ".sheet-navigation",
                    contentSelector: ".article-body",
                    initial: "description"
                }]
        });
    }

    /**
     * @override
     */
    getData() {
        return mergeObject(super.getData(), {
            cercles: Game.alchimie.cercles,
            domaines: Game.analogie.domaines,
            catalyseurs: game.settings.get('neph5e', 'catalyseurs'),
            useCombatSystem: game.settings.get('neph5e', 'useCombatSystem'),
            editedCapacity: this.editedCapacity,
            simulacre: this.actor.simulacre
        });
    }

    /**
     * @override
     */
    _updateObject(event, formData) {

        // The materiae primae: only save the delta to add to the theorical maximum mp
        for (let elt of ['air', 'eau', 'feu', 'lune', 'terre']) {
            const input = formData["system.alchimie.primae." + elt + ".max"];
            const delta = input - this.actor.getMaxBaseMP(elt);
            formData["system.alchimie.primae." + elt + ".max"] = delta;
        }

        // Update the actor
        super._updateObject(event, formData);

    }

    /**
     * @override
     */
    activateListeners(html) {

        super.activateListeners(html);

        super.activateCombatListeners(html);

        super.activateOptionListeners(html);

        // Ka Soleil
        html.find('.actor-root .side .soleil .dice').click(this._onRollKa.bind(this));

        // General
        html.find('div[data-tab]').on("drop", this._onDrop.bind(this));

        // Vecus
        html.find('div[data-family="vecus"] .vecu .open').click(this._onOpenItem.bind(this));
        html.find('div[data-family="vecus"] .vecu .roll').click(this._onRollItem.bind(this));

        // Akasha
        html.find('div[data-tab="akasha"] .activate').click(this._onToggleVaisseau.bind(this));

        // Incarnations
        html.find('div[data-tab="incarnations"] .activate').click(this._onActivatePeriode.bind(this));
        html.find('div[data-tab="incarnations"] .set').change(this._onChangeDegre.bind(this));
        html.find('div[data-tab="incarnations"] .display').click(this._onDisplayPeriode.bind(this));
        html.find('div[data-tab="incarnations"] .edit').click(this._onEditPeriode.bind(this));
        html.find('div[data-tab="incarnations"] .define').click(this._onCurrentPeriode.bind(this));
        html.find('div[data-tab="incarnations"] .open').click(this._onOpenItem.bind(this));
        html.find('div[data-tab="incarnations"] .periode-header .delete').click(this._onDeletePeriode.bind(this));
        html.find('div[data-tab="incarnations"] .vecu .delete').click(this._onDeleteEmbeddedItem.bind(this));
        html.find('div[data-tab="incarnations"] .focus .delete').click(this._onDeleteEmbeddedItem.bind(this));

        // Options
        html.find('div[data-tab="options"] .incarnationsOuvertes').change(this._onChangePeriodesDisplay.bind(this));

        // Fraternites
        html.find('.sheet-navigation-tab[data-tab="actor"]').click(this._onOpenActor.bind(this));

        // Combat
        html.find('div[data-tab="combat"] .capacites .esquive').click(this._onEditCapacity.bind(this, 'esquive'));
        html.find('div[data-tab="combat"] .capacites .lutte').click(this._onEditCapacity.bind(this, 'lutte'));
        html.find('div[data-tab="combat"] .ressource .open').click(this._onOpenItem.bind(this));
        html.find('div[data-tab="combat"] .ressource .roll').click(this._onRollItem.bind(this));

        // Nephilim
        html.find('div[data-tab="nephilim"] .khaiba').click(this._onChute.bind(this, 'khaiba'));
        html.find('div[data-tab="nephilim"] .narcose').click(this._onChute.bind(this, 'narcose'));
        html.find('div[data-tab="nephilim"] .ombre').click(this._onChute.bind(this, 'ombre'));
        html.find('div[data-tab="nephilim"] .luneNoire').click(this._onChute.bind(this, 'luneNoire'));
        html.find('div[data-tab="nephilim"] .formed').click(this._onToggleMetamorphose.bind(this, 'formed'));
        html.find('div[data-tab="nephilim"] .visible').click(this._onToggleMetamorphose.bind(this, 'visible'));
        html.find('div[data-tab="nephilim"] .element .dice').click(this._onRollKa.bind(this));
        html.find('div[data-tab="nephilim"] .arcane .roll').click(this._onRollItem.bind(this));
        html.find('div[data-tab="nephilim"] .open').click(this._onOpenItem.bind(this));

        // Selenim
        html.find('div[data-tab="selenim"] .element .dice').click(this._onRollKa.bind(this));
        html.find('div[data-tab="selenim"] .aspect .open').click(this._onOpenItem.bind(this));
        html.find('div[data-tab="selenim"] .aspect .delete').click(this._onDeleteEmbeddedItem.bind(this));
        html.find('div[data-tab="selenim"] .visible').click(this._onToggleAspect.bind(this));

        // Sciences occultes
        html.find('div[data-family="science"] .header .cercle-menu .roll').click(this._onRollItem.bind(this));
        html.find('div[data-family="science"] .science-header .roll').click(this._onRollItem.bind(this));
        html.find('div[data-family="science"] .focus .open').click(this._onOpenItem.bind(this));
        html.find('div[data-family="science"] .focus .roll').click(this._onRollItem.bind(this));
        html.find('div[data-family="science"] .focus-possede').click(this._onChangeFocus.bind(this));
        html.find('div[data-family="science"] .focus-status').click(this._onChangeStatus.bind(this));
        html.find('div[data-family="science"] .focus-pacte').click(this._onChangePacte.bind(this));
        html.find('div[data-family="science"] .focus-quantite').change(this._onChangeQuantite.bind(this));
        html.find('div[data-family="science"] .focus-transporte').change(this._onChangeTransporte.bind(this));

        // Kabbale
        html.find('div[data-tab="kabbale"] .edit-ordonnance').click(this._onEditFeature.bind(this, 'ordonnance'));
        
        // Alchimie
        html.find('div[data-tab="laboratoire"] .activate').click(this._onConstruct.bind(this));
        html.find('div[data-tab="laboratoire"] .select').click(this._onSelectLaboratory.bind(this));
        html.find('div[data-tab="laboratoire"] .delete').click(this._onDeleteLaboratory.bind(this));
        html.find('div[data-tab="materiae"] .open').click(this._onOpenItem.bind(this));
        html.find('div[data-tab="materiae"] .quantite').change(this._onChangeMateriae.bind(this));
        html.find('div[data-tab="materiae"] .delete').click(this._onDeleteEmbeddedItem.bind(this));

        // Bohemien
        html.find('div[data-tab="bohemien"] .element .dice').click(this._onRollKa.bind(this));
        html.find('div[data-tab="bohemien"] .science-header-bohemien .divination .roll').click(this._onRollItem.bind(this));

        // Macros
        html.find('.actor-root .side .macro, div[data-tab="vecus"] .macro, div[data-tab="nephilim"] .macro, div[data-tab="selenim"] .macro, div[data-tab="alchimie"] .macro, div[data-tab="kabbale"] .macro, div[data-tab="magie"] .macro, div[data-tab="necromancie"] .macro, div[data-tab="conjuration"] .macro, div[data-tab="coupe"] .macro, div[data-tab="epee"] .macro, div[data-tab="denier"] .macro, div[data-tab="baton"] .macro, div[data-tab="dracomachie"] .macro, div[data-tab="bohemien"] .macro, div[data-tab="analogie"] .macro').each((i, li) => {
            li.setAttribute("draggable", true);
            li.addEventListener("dragstart", event => this.onAddMacro(event), false);
        });

    }

    /**
     * Drop the specified object.
     * @param event The drop event.
     */
    async _onDrop(event) {

        // Catch and retrieve the dropped item
        event.preventDefault();
        const dropped = await super.droppedObject(event);
        switch (dropped?.type) {
            case 'item':
                const item = dropped.object;
                if (item.hasOwnProperty('system')) {

                    // Check if the tab is compliant with the item to drop
                    const currentTab = $(event.currentTarget).find("div.tab.active").data("tab");
                    const tabs = this._droppableTabs(item.type);
                    if (tabs.includes(currentTab) !== true) {
                        return false;
                    }

                    // Process the drop
                    switch(item.type) {
                        case 'arme':
                            await super._onDropWeapon(event, item);
                            break;
                        case 'armure':
                            await super._onDrop(event);
                            break;
                        case 'alchimie':
                        case 'aspect':
                        case 'catalyseur':
                        case 'magie':
                        case 'materiae':
                        case 'metamorphe':
                        case 'periode':
                            if (this.actor.locked) return;
                            await new FeatureBuilder(this.actor)
                                .withOriginalItem(item.sid)
                                .withEvent(event)
                                .withPeriode(this.editedPeriode)
                                .withManoeuver(this.editedCapacity)
                                .create()
                                .drop();
                            break;
                        case 'competence':
                        case 'vecu':
                            await new FeatureBuilder(this.actor)
                                .withOriginalItem(item.sid)
                                .withEvent(event)
                                .withPeriode(this.editedPeriode)
                                .withManoeuver(this.editedCapacity)
                                .create()
                                .drop();
                            break;
                        case 'arcane':
                        case 'chute':
                        case 'ordonnance':
                        case 'passe':
                        case 'quete':
                        case 'savoir':
                        case 'science': {
                            if (this.editedPeriode != null) {
                                await new FeatureBuilder(this.actor)
                                    .withOriginalItem(item.sid)
                                    .withEvent(event)
                                    .withPeriode(this.editedPeriode)
                                    .withManoeuver(this.editedCapacity)
                                    .create()
                                    .drop();
                            }
                            break;
                        }
                        case 'appel':
                        case 'atlanteide':
                        case 'divination':
                        case 'dracomachie':
                        case 'formule':
                        case 'invocation':
                        case 'pratique':
                        case 'rite':
                        case 'rituel':
                        case 'technique':
                        case 'tekhne':
                        case 'sort':
                        case 'habitus': {
                            if (this.editedPeriode != null) {
                                await new FeatureBuilder(this.actor)
                                    .withOriginalItem(item.sid)
                                    .withPeriode(this.editedPeriode)
                                    .create()
                                    .drop();
                            }
                            break;
                        }
                    }
                }
                break;

            case 'actor':
                const actor = dropped.object;
                switch (actor.type) {

                    // Drop the new simulacre on the figure
                    case 'figurant':
                        if (this.actor.system.options.simulacre === true && actor.hasOwnProperty('system') && actor.sid != "") {
                            await this.actor.update({ ['system.simulacre']: actor.sid });
                        }
                        break;

                    // Drop the new laboratoire
                    case 'figure':
                        const currentTab = $(event.currentTarget).find("div.tab.active").data("tab");
                        if (currentTab === 'laboratoire') {
                            const laboratoires = this.actor.system.alchimie.laboratoires;
                            if (!laboratoires.includes(actor.sid)) {
                                laboratoires.push(actor.sid);
                                await this.actor.update({ ['system.alchimie.laboratoires']: laboratoires });
                            }
                        }
                        break;

                }
                break;
        }

    }

    /**
     * @param type The type of item to drop.
     * @returns the tabs on which the item can be dropped.
     */
    _droppableTabs(type) {
        switch (type) {
            case 'arme':
            case 'armure':
            case 'competence':
                return ['combat'];
            case 'alchimie':
                return ['alchimie'];
            case 'aspect':
                return ['selenim'];
            case 'magie':
                return ['magie'];
            case 'catalyseur':
            case 'materiae':
                return ['materiae'];
            case 'metamorphe':
                return ['nephilim'];
            case 'vecu':
                return ['combat','incarnations'];
            case 'periode':
            case 'appel':
            case 'arcane':
            case 'atlanteide':
            case 'chute':
            case 'dracomachie':
            case 'formule':
            case 'habitus':
            case 'invocation':
            case 'ordonnance':
            case 'passe':
            case 'pratique':
            case 'quete':
            case 'rite':
            case 'rituel':
            case 'savoir':
            case 'science':
            case 'sort':
            case 'technique':
            case 'tekhne':
            case 'divination':
                return ['incarnations'];
            default:
                return [];
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

    /**
     * Roll the specified original item.
     * @param event The click event.
     * @returns the instance.
     */
    async _onRollItem(event) {
        const feature = this._createFeature(event);
        await feature.initializeRoll();
        return this;
    }

    /**
     * Set the number of vaisseaux alchimiques.
     * Used by:
     *  - formule
     * @param event The click event.
     */
    async _onChangeQuantite(event) {
        event.preventDefault();
        if (this.actor.locked) return;
        const sid = $(event.currentTarget).closest('.item').data('sid');
        const item = this.actor.items.find(i => i.sid === sid);
        const value = $(event.currentTarget).closest(".focus-quantite").val();
        await item.update({ ['system.quantite']: parseInt(value) });
    }

    /**
     * Set the number of vaisseaux alchimiques.
     * Used by:
     *  - formule
     * @param event The click event.
     */
    async _onChangeTransporte(event) {
        event.preventDefault();
        if (this.actor.locked) return;
        const sid = $(event.currentTarget).closest('.item').data('sid');
        const item = this.actor.items.find(i => i.sid === sid);
        const value = $(event.currentTarget).closest(".focus-transporte").val();
        await item.update({ ['system.transporte']: parseInt(value) });
    }

    /**
     * Set the pacte of the item.
     * Used by:
     *  - invocation
     * @param event The click event.
     */
    async _onChangePacte(event) {
        event.preventDefault();
        if (this.actor.locked) return;
        const sid = $(event.currentTarget).closest('.item').data('sid');
        const item = this.actor.items.find(i => i.sid === sid);
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
    async _onChangeFocus(event) {
        event.preventDefault();
        if (this.actor.locked) return;
        const sid = $(event.currentTarget).closest('.item').data('sid');
        const item = this.actor.items.find(i => i.sid === sid);
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
    async _onChangeStatus(event) {
        event.preventDefault();
        if (this.actor.locked) return;
        const sid = $(event.currentTarget).closest('.item').data('sid');
        const item = this.actor.items.find(i => i.sid === sid);
        switch (item.system.status) {
            case Constants.CONNU:
                await item.update({ ['system.status']: Constants.DECHIFFRE });
                break;
            case Constants.DECHIFFRE:
                await item.update({ ['system.status']: Constants.APPRIS });
                break;
            case Constants.APPRIS:
                await item.update({ ['system.status']: Constants.TATOUE });
                break;
            case Constants.TATOUE:
                await item.update({ ['system.status']: Constants.CONNU });
                break;
            default:
                throw new Error("Status " + item.system.status + " not implemented");
        }
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

    /**
     * Activate or deactivate the specified construct.
     * @param event The click event.
     */
    async _onConstruct(event) {
        event.preventDefault();
        if (this.actor.locked) return;
        if (this.actor.system.alchimie.courant == null && this.actor.locked === false) {
            const construct = $(event.currentTarget).closest('.tooltip').data('type');
            const activated = this.actor.system.alchimie.constructs[construct].active;
            await this.actor.update({ ['system.alchimie.constructs.' + construct + ".active"]: !activated });
        }
    }

    /**
     * Select the specified laboratory.
     * @param event The click event.
     */
    async _onSelectLaboratory(event) {
        event.preventDefault();
        if (this.actor.locked) return;
        const sid = $(event.currentTarget).closest('.select').data('sid');
        await this.actor.update({ ['system.alchimie.courant']: sid == null ? null : sid });
    }

    /**
     * Delete the specified laboratory.
     * @param event The click event.
     */
    async _onDeleteLaboratory(event) {
        event.preventDefault();
        if (this.actor.locked) return;
        const sid = this.actor.system.alchimie.courant;
        const labs = this.actor.system.alchimie.laboratoires.filter(i => i !== sid);
        await this.actor.update({ ['system.alchimie.laboratoires']: labs });
        await this.actor.update({ ['system.alchimie.courant']: null });
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