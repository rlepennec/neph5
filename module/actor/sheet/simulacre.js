import { Rolls } from "../../common/rolls.js";
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
        html.find('div[data-tab="description"] .roll-attribute').click(this._onRollAttribute.bind(this));
        html.find('div[data-tab="description"] .roll-vecu').click(this._onRollVecu.bind(this));
        html.find('div[data-tab="description"] .delete-vecu').click(this._onDeleteEmbeddedItem.bind(this));
        html.find('div[data-tab="description"] .edit-vecu').click(this._onEditEmbeddedItem.bind(this));
        html.find('div[data-tab="description"] .degre-vecu').change(this._onDegreVecu.bind(this));
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

    async _onDegreVecu(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const degre = parseInt(event.currentTarget.value);
        const item = this.actor.items.get(id);
        await item.update({"data.degre": degre});
    }

    async _onRollAttribute(event) {
        const attribute = $(event.currentTarget).data("attribute");
        let sentence = "";
        switch (attribute) {
            case 'soleil':
                sentence = "fait appel à son Ka Soleil";
                break;
            case 'agile':
                sentence = "fait appel à son agilité";
                break;
            case 'endurant':
                sentence = "fait appel à son endurance";
                break;
            case 'fort':
                sentence = "fait appel à sa force";
                break;
            case 'intelligent':
                sentence = "fait appel à son intelligence";
                break;
            case 'seduisant':
                sentence = "fait appel à son charisme";
                break;
            case 'savant':
                sentence = "fait appel à sa culture";
                break;
            case 'sociable':
                sentence = "fait appel à sa sociabilité";
                break;
            case 'fortune':
                sentence = "fait appel à sa fortune";
                break;
        }
        return Rolls.check(
            this.actor,
            { img: 'systems/neph5e/icons/caracteristique.jpg' },
            attribute,
            {
                ...this.actor.data,
                owner: this.actor.id,
                difficulty: this.actor.data.data[attribute],
                sentence: sentence
            }
        );
    }

    async _onRollVecu(event) {
        const li = $(event.currentTarget).parents(".item");
        const actor = this.actor;
        const item = actor.items.get(li.data("item-id"));
        return Rolls.check(
            actor,
            item,
            item.type,
            {
                ...item.data,
                owner: actor.id,
                difficulty: item.data.data.degre,
                sentence: "fait appel à son vécu de " + item.name
            }
        );
    }

}