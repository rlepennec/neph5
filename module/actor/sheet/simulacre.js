import { droppedItem } from "../../item/tools.js";;
import { UUID } from "../../common/tools.js";

export class SimulacreSheet extends ActorSheet {

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
            data: baseData.actor.data.data
        }
        return sheetData;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('div[data-tab="description"]').on("drop", this._onDrop.bind(this));
    }

    async _onDrop(event) {
        event.preventDefault();
        const item = await droppedItem(event);
        if (item != null && item.hasOwnProperty('data')) {
            if (item.data.type === "vecu") {
                const tab = event.currentTarget.className;
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

}