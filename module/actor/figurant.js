import { BaseSheet } from "./base.js";
import { FeatureBuilder } from "../../feature/core/featureBuilder.js";
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

        super.activateCombatListeners(html);

        super.activateOptionListeners(html);

        html.find('div[data-tab="combat"] .ka .roll').click(this._onRollKa.bind(this));
        html.find('div[data-tab="combat"] .menace .roll').click(this._onRollMenace.bind(this));
        html.find('div[data-tab="combat"] .vecu .roll').click(this._onRollVecu.bind(this));
        html.find('div[data-tab="combat"] .vecu .open').click(this._onEditVecu.bind(this));
        html.find('div[data-tab="combat"] .vecu .delete').click(this._onDeleteVecu.bind(this));
        html.find('div[data-tab="combat"] .vecu input').change(this._onDegreVecu.bind(this));
        html.find('div[data-tab="combat"] .ressource .open').click(this._onEditRessource.bind(this));
        html.find('div[data-tab="combat"] .ressource input').change(this._onDegreRessource.bind(this));
        html.find('div[data-tab="combat"] .ressource .delete').click(this._onDeleteRessource.bind(this));
    }

    /**
     * Update the specified vecu.
     * @param event The click event.
     */
    async _onDegreVecu(event) {
        const id = $(event.currentTarget).closest(".vecu").data("id");
        const degre = parseInt(event.currentTarget.value);
        const item = this.actor.items.get(id);
        await item.update({"system.degre": degre});
    }

    /**
     * Roll the specified vecu.
     * @param event The click event.
     */
    async _onRollVecu(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".vecu").data("id");
        const item = this.actor.items.get(id);
        await new FeatureBuilder(this.actor).withScope('actor').withEmbeddedItem(item.id).create().initializeRoll();
    }

    /**
     * Edit the specified item.
     * @param event The click event.
     */
    async _onEditVecu(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".vecu").data("id");
        const item = this.actor.getEmbeddedDocument('Item', id);
        await item.sheet.render(true);
    }

    /**
     * Delete the specified item.
     * @param event The click event.
     */
    async _onDeleteVecu(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".vecu").data("id");
        await this.actor.deleteEmbeddedDocuments('Item', [id]);
    }

    /**
     * Update the specified ressource.
     * @param event The click event.
     */
    async _onDegreRessource(event) {
        const id = $(event.currentTarget).closest(".ressource").data("id");
        const degre = parseInt(event.currentTarget.value);
        const item = this.actor.items.get(id);
        await item.update({"system.degre": degre});
    }

    /**
     * Edit the specified item.
     * @param event The click event.
     */
    async _onEditRessource(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".ressource").data("id");
        const item = this.actor.getEmbeddedDocument('Item', id);
        await item.sheet.render(true);
    }

    /**
     * Delete the specified item.
     * @param event The click event.
     */
    async _onDeleteRessource(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".ressource").data("id");
        await this.actor.deleteEmbeddedDocuments('Item', [id]);
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
                    await new FeatureBuilder(this.actor)
                        .withOriginalItem(item.sid)
                        .withEvent(event)
                        .withPeriode(item.system.periode)
                        .create()
                        .drop();
                case 'passe':
                    await new FeatureBuilder(this.actor)
                        .withOriginalItem(item.sid)
                        .withEvent(event)
                        .create()
                        .drop();
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
            case 'passe':
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