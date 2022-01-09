import { NephilimItemSheet } from "./base.js";
import { droppedItem } from "../../common/tools.js";
import { updateItemRefs } from "../../common/tools.js";
import { deleteItemRefs } from "../../common/tools.js";

export class VecuSheet extends NephilimItemSheet {

    /** 
     * @override
     */
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 560,
            height: 400,
            classes: ["nephilim", "sheet", "item"],
            resizable: true,
            scrollY: [".tab.description"],
            tabs: [{navSelector: ".tabs", contentSelector: ".sheet-body", initial: "description"}]
      });
    }

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('div[data-tab="description"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="description"] .item-edit').click(this.onEdit.bind(this));
        html.find('div[data-tab="description"] .item-delete').click(this._onDelete.bind(this));
    }

    /**
     * This function catches the drop on a competence.
     * @param {*} event 
     */
    async _onDrop(event) {
        event.preventDefault();
        const drop = await droppedItem(event.originalEvent);
        if (drop?.data?.type === "competence") {
            await updateItemRefs(this.item, drop.data, this.item.data.data.competences, "data.competences", false);
        }
    }

    /**
     * This function catches the deletion of a competence from the list of competences.
     */
    async _onDelete(event) {
        await deleteItemRefs(this.item, event, this.item.data.data.competences, "data.competences");
    }

    /**
     * @override
     */
    _updateObject(event, formData) {

        // Update competences
        let size = this.item.data.data.competences.length;
        const competences = [];
        for (let index = 0; index < size; index++) {
            const name = "data.competences.[" + index + "]";
            competences.push({ refid: formData[name + ".refid"] });
            delete formData[name + ".refid"];
        }
        formData["data.competences"] = competences;

        // Update object
        super._updateObject(event, formData);
    }

}