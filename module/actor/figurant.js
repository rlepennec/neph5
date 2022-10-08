import { AbstractRollBuilder } from "../../feature/core/abstractRollBuilder.js";
import { BaseSheet } from "./base.js";
import { CustomHandlebarsHelpers } from "../common/handlebars.js";
import { Ka } from "../../feature/nephilim/ka.js";
import { Menace } from "../../feature/combat/core/menace.js";
import { NephilimItemSheet } from "../item/base.js";

export class FigurantSheet extends BaseSheet {

    /**
     * @constructor
     * @param  {...any} args
     */
    constructor(...args) {
        super(...args);
    }

    /**
     * @return the path of the specified actor sheet.
     */
    get template() {
        return 'systems/neph5e/templates/actor/figurant.html';
    }

    /**
     * @override
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 1000,
            height: 800,
            classes: ["nephilim", "sheet", "actor"],
            resizable: true,
            scrollY: [
                ".tab.general",
                ".tab.combat"],
            tabs: [
                {
                    navSelector: ".tabs",
                    contentSelector: ".sheet-body",
                    initial: game.user.isGM ? "combat" : "general"
                }]
        });
    }

    getData() {
        const baseData = super.getData();
        let sheetData = {
            owner: this.actor.isOwner,
            editable: this.isEditable,
            actor: baseData.actor,
            system: baseData.actor.system,
            useCombatSystem: game.settings.get('neph5e', 'useCombatSystem')
        }
        return sheetData;
    }

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('div[data-tab="combat"] .delete-vecu').click(this._onDeleteEmbeddedItem.bind(this));
        html.find('div[data-tab="combat"] .edit-vecu').click(this._onEditEmbeddedItem.bind(this));
        html.find('div[data-tab="combat"] .degre-vecu').change(this._onDegreVecu.bind(this));
        html.find('div[data-tab="combat"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="combat"] .roll-ka').click(this._onRollKa.bind(this));
        html.find('div[data-tab="combat"] .roll-menace').click(this._onRollMenace.bind(this));
        html.find('div[data-tab="combat"] .roll-vecu').click(this._onRollVecu.bind(this));
    }
s
    async _onDegreVecu(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const degre = parseInt(event.currentTarget.value);
        const item = this.actor.items.get(id);
        await item.update({"system.degre": degre});
    }

    /**
     * Roll the specified vecu.
     * @param event The click event.
     * @returns the instance.
     */
    async _onRollVecu(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".roll-vecu").data("item");
        const item = this.actor.items.get(id);
        await new AbstractRollBuilder(this.actor).withScope('actor').withItem(item).create().initialize();
        return this;
    }

    async _onEditItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = this.actor.getEmbeddedDocument('Item', id);
        await item.sheet.render(true);
    }

    async _onDeleteItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        return await this.actor.deleteEmbeddedDocuments('Item', [li.data("item-id")]);
    }

    /**
     * @override
     */
    _updateObject(event, formData) {
        if (formData['system.id'] == null || formData['system.id'] === "") {
            formData['system.id'] = CustomHandlebarsHelpers.UUID();
        }
        super._updateObject(event, formData);
    }

    /**
     * Drop the specified object.
     * @param event The drop event.
     */
    async _onDrop(event) {
        event.preventDefault();
        const item = await NephilimItemSheet.droppedItem(event);
        if (item != null && item.hasOwnProperty('system')) {
            switch(item.type) {
                case 'arme':
                    await super._onDropWeapon(event, item);
                    break;
                case 'armure':
                    await super._onDrop(event);
                    break;
                case 'vecu':
                    await new AbstractRollBuilder(this.actor).withItem(item).withPeriode(item.system.periode).create().drop();
                    break;
            }
        }
    }

    // ---------------------------------------- Roll handlers ----------------------------------------

    async _onRollKa(event) {
        return await new Ka(this.actor, null, null).initialize();
    }

    async _onRollMenace(event) {
        return await new Menace(this.actor).initialize();
    }

}