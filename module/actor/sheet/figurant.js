import { UUID } from "../../common/tools.js";
import { droppedItem2 } from "../../item/tools.js";
import { CustomHandlebarsHelpers } from "../../common/handlebars.js";

export class FigurantSheet extends ActorSheet {

    /**
     * @constructor
     * @param  {...any} args
     */
    constructor(...args) {
        super(...args);
        this.options.submitOnClose = true;
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
                { navSelector: ".tabs",
                  contentSelector: ".sheet-body",
                  initial: "description" }]
      });
    }

    getData() {
        const baseData = super.getData();
        let sheetData = {
            owner: this.actor.isOwner,
            editable: this.isEditable,
            actor: baseData.actor,
            data: baseData.actor.data.data,
            useV3: game.settings.get('neph5e', 'useV3')
        }
        return sheetData;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('div[data-tab="description"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="description"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="description"] .item-delete').click(this._onDeleteItem.bind(this));
        html.find('div[data-tab="description"] .item-roll').click(this._onRoll.bind(this));
    }

    async _onEditItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = this.actor.getEmbeddedDocument('Item', id);
        const toto = this.getArme('trait');
        item.sheet.render(true);
    }

    async _onDeleteItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        return await this.actor.deleteEmbeddedDocuments('Item', [li.data("item-id")]);
    }

    async _onRoll(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const type = li.data("item-type");
        return await this.actor.rollSimulacre(id, true, type);
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

    getArme(skill) {
        if (skill === 'trait' || skill === 'feu' || skill === 'lourde') {
            return this.getDistance();
        } else if (skill == 'melee') {
            return this.getMelee();
        } else {
            return null;
        }
    }

    getDistance() {
        for (const item of this.actor.items.values()) {
            if (item.data.type === 'arme' && (item.data.data.skill === 'trait' || item.data.data.skill === 'feu' || item.data.data.skill === 'lourde')) {
                return item;
            }
        };
        return null;
    }

    getMelee() {
        for (const item of this.actor.items.values()) {
            if (item.data.type === 'arme' && (item.data.data.skill === 'melee')) {
                return item;
            }
        };
        return null;
    }

    /**
     * This function catches the drop
     * @param {*} event 
     */
    async _onDrop(event) {
        //
        event.preventDefault();
        const item = await droppedItem2(event);
        if (item != null && item.hasOwnProperty('data')) {
            if (item.data.type === "arme") {
                await super._onDrop(event);
            } else if (item.data.type === "armure") {
                await super._onDrop(event);
            }
        }
    }

}