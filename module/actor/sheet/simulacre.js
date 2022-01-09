import { droppedItem } from "../../common/tools.js";;
import { UUID } from "../../common/tools.js";
import { BaseSheet } from "./base.js";

export class SimulacreSheet extends BaseSheet {

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
        return 'systems/neph5e/templates/actor/simulacre.html';
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
        html.find('div[data-tab="description"] .item-roll').click(this._onRoll.bind(this));
    }

    async _onDrop(event) {
        event.preventDefault();
        const item = await droppedItem(event);
        if (item != null && item.hasOwnProperty('data')) {
            if (item.data.type === "vecu") {
                const vecu = duplicate(this.actor.data.data.vecu);
                vecu.refid = item.data.data.id;
                vecu.degre = 0;
                await this.actor.update({['data.vecu']: vecu});
            }
        }
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