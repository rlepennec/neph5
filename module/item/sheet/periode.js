import { NephilimItemSheet } from "./base.js";
import { droppedItem } from "../../common/tools.js";
import { updateItemRefs } from "../../common/tools.js";
import { deleteItemRefs } from "../../common/tools.js";

export class PeriodeSheet extends NephilimItemSheet {

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
     * This function catches the drop on the vecu list
     * @param {*} event 
     */
    async _onDrop(event) {
        event.preventDefault();
        const drop = await droppedItem(event.originalEvent);
        if (drop.data.type === "vecu") {
            await updateItemRefs(this.item, drop.data, this.item.data.data.vecus, "data.vecus", false);
        }
    }

    /**
     * This function catches the deletion of a vecu from the list of vecus.
     */
    async _onDelete(event) {

        // Retrieve the id of the reference to delete
        const li = $(event.currentTarget).closest(".item");
        const type = li.data("item-type");
        const id = li.data("item-id");

        if (type == "vecu") {
            await deleteItemRefs(this.item, event, this.item.data.data.vecus, "data.vecus");
        }

    }

    /**
     * @override
     */
    _updateObject(event, formData) {

        // Update vecus
        let size = this.item.data.data.vecus.length;
        const vecus = [];
        for (let index = 0; index < size; index++) {
            const name = "data.vecus.[" + index + "]";
            vecus.push({ refid: formData[name + ".refid"] });
            delete formData[name + ".refid"];
        }
        formData["data.vecus"] = vecus;

        // Update object
        super._updateObject(event, formData);
    }

}