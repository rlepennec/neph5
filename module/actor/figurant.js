import { AbstractRollBuilder } from "../../feature/core/AbstractRollBuilder.js";
import { BaseSheet } from "./base.js";
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
                    navSelector: ".sheet-navigation",
                    contentSelector: ".article-body",
                    initial: game.user.isGM ? "combat" : "general"
                }]
        });
    }

    /**
     * @override
     */
    getData() {
        return mergeObject(super.getData(), {
            useCombatSystem: game.settings.get('neph5e', 'useCombatSystem')
        });
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
        await new AbstractRollBuilder(this.actor).withScope('actor').withItem(item).create().initializeRoll();
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
     * Drop the specified object.
     * @param event The drop event.
     */
    async _onDrop(event) {
        event.preventDefault();
        const item = await NephilimItemSheet.droppedItem(event);
        if (item != null && item.hasOwnProperty('system')) {

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
                case 'vecu':
                    await new AbstractRollBuilder(this.actor).withItem(item).withEvent(event).withPeriode(item.system.periode).create().drop();
                    break;
            }
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
            case 'vecu':
                return ['combat'];
            default:
                return [];
        }
    }

    // ---------------------------------------- Roll handlers ----------------------------------------

    async _onRollKa(event) {
        return await new Ka(this.actor, null, null).initializeRoll();
    }

    async _onRollMenace(event) {
        return await new Menace(this.actor).initializeRoll();
    }

}