import { UUID } from "../../common/tools.js";
import { Game } from "../../common/game.js";
import { droppedItem } from "../../common/tools.js";
import { BaseSheet } from "./base.js";

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
            width: 700,
            height: 800,
            classes: ["nephilim", "sheet", "actor"],
            resizable: true,
            scrollY: [
                ".tab.description"],
            tabs: [
                {
                    navSelector: ".tabs",
                    contentSelector: ".sheet-body",
                    initial: "description"
                }]
        });
    }

    getData() {
        const baseData = super.getData();
        let sheetData = {
            owner: this.actor.isOwner,
            editable: this.isEditable,
            actor: baseData.actor,
            data: baseData.actor.data.data,
            useV3: game.settings.get('neph5e', 'useV3'),
            useCombatSystem: game.settings.get('neph5e', 'useCombatSystem'),
            effects: {
                desoriente: this?.token?.combatant?.effectIsActive(Game.effects.desoriente),
                immobilise: this?.token?.combatant?.effectIsActive(Game.effects.immobilise),
                projete: this?.token?.combatant?.effectIsActive(Game.effects.projete)
            }
        }
        return sheetData;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('div[data-tab="description"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="description"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="description"] .item-delete').click(this._onDeleteItem.bind(this));
        html.find('div[data-tab="description"] .item-roll').click(this._onRoll.bind(this));
        html.find('div[data-tab="description"] .item-attack').click(this._onAttack.bind(this));
        html.find('div[data-tab="description"] .item-wrestle').click(this._onWrestle.bind(this));
        html.find('div[data-tab="description"] .item-move').click(this._onMove.bind(this));
        html.find('div[data-tab="description"] .item-use').click(this._onUseItem.bind(this));
        html.find('div[data-tab="description"] #desoriente').click(this._onDesoriente.bind(this));
        html.find('div[data-tab="description"] #immobilise').click(this._onImmobilise.bind(this));
        html.find('div[data-tab="description"] #projete').click(this._onProjete.bind(this));
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
        if (formData['data.id'] === "") {
            formData['data.id'] = UUID();
        }
        super._updateObject(event, formData);
    }

    /**
     * This function catches the drop
     * @param {*} event 
     */
    async _onDrop(event) {
        //
        event.preventDefault();
        const item = await droppedItem(event);
        if (item !== null && item.hasOwnProperty('data')) {
            if (item.data.type === "arme") {
                await super._onDrop(event);
            } else if (item.data.type === "armure") {
                await super._onDrop(event);
            }
        }
    }

    /**
     * Gets the token id of the specified actor on the current canvas.
     * @param {*} actor 
     * @returns 
     */
    async getToken(actor) {
        if (!actor) return null;
        const selected = game.canvas.tokens.controlled;
        if (selected.length > 1 || selected.length == 0) {
            return null;
        }
        if (selected[0].actor.data._id !== actor.data._id) {
            return null;
        }
        return (selected[0]);
    }

    async _onRoll(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const type = li.data("item-type");
        if (type === "") {
            return await this.actor.rollSimulacre(this.actor.data.data.id, true, "menace");
        } else {
            return await this.actor.rollSimulacre(id, true, type);
        }
    }

}