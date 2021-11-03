import { UUID } from "../../common/tools.js";

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
        html.find('div[data-tab="description"] .item-roll').click(this._onRoll.bind(this));
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

}