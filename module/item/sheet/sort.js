import { NephilimItemSheet } from "./base.js";
import { droppedItem } from "../../common/tools.js";
import { updateItemRefs } from "../../common/tools.js";
import { deleteItemRefs } from "../../common/tools.js";
import { Game } from "../../common/game.js";

export class SortSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.elements = Game.elements;
        data.cercles = Game.magie.cercles;
        return data;
    }

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
        html.find('div[data-tab="description"] .item-delete').click(this._onDelete.bind(this));
    }

    /**
     * This function catches the drop on a voie.
     * @param {*} event 
     */
    async _onDrop(event) {
        event.preventDefault();
        const drop = await droppedItem(event);
        if (drop.data.type === "magie") {
            await updateItemRefs(this.item, drop.data, this.item.data.data.voies, "data.voies", false);
        }
    }

    /**
     * This function catches the deletion of a voie from the list of voies.
     */
    async _onDelete(event) {
        await deleteItemRefs(this.item, event, this.item.data.data.voies, "data.voies");
    }

    /**
     * @override
     */
    _updateObject(event, formData) {

        // Update voies
        if (formData["data.cercle"] === "basseMagie" || formData["data.cercle"] === "grandSecret") {
            formData["data.voies"] = [];
        } else {
            let size = this.item.data.data.voies.length;
            const voies = [];
            for (let index = 0; index < size; index++) {
                const name = "data.voies.[" + index + "]";
                voies.push({ refid: formData[name + ".refid"] });
                delete formData[name + ".refid"];
            }
            formData["data.voies"] = voies;
        }

        // Update object
        super._updateObject(event, formData);
    }

}