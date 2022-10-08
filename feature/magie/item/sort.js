import { NephilimItemSheet } from "../../../module/item/base.js";
import { Game } from "../../../module/common/game.js";

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
            height: 500,
            classes: ["nephilim", "sheet", "item"]
        });
    }

    /** 
     * @override
     */
    get template() {
        return `systems/neph5e/feature/magie/item/sort.html`;
    }

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.tbd').on("drop", this._onDrop.bind(this));
        html.find('.delete-voie').click(this._onDelete.bind(this));
    }

    /**
     * This function catches the drop on a voie.
     * @param {*} event 
     */
    async _onDrop(event) {
        event.preventDefault();
        const drop = await NephilimItemSheet.droppedItem(event.originalEvent);
        if (drop.type === "magie") {
            await this.item.updateItemRefs(drop.system, this.item.system.voies, "system.voies");
        }
    }

    /**
     * This function catches the deletion of a voie from the list of voies.
     */
    async _onDelete(event) {
        await this.item.deleteItemRefs(event, this.item.system.voies, "system.voies");
    }

    /**
     * @override
     */
    _updateObject(event, formData) {

        // Update voies
        if (formData["system.cercle"] === "basseMagie" || formData["system.cercle"] === "grandSecret") {
            formData["system.voies"] = [];
        } else {
            let size = this.item.system.voies.length;
            const voies = [];
            for (let index = 0; index < size; index++) {
                const name = "system.voies.[" + index + "]";
                voies.push(formData[name]);
                delete formData[name];
            }
            formData["system.voies"] = voies;
        }

        // Update object
        super._updateObject(event, formData);
    }

}