import { Game } from "../../../module/common/game.js";
import { NephilimItemSheet } from "../../../module/item/base.js";

export class HabitusSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getOriginalData() {
        return {
            elements: Game.elements,
            cercles: super.cerclesOf('analogie')
        }
    }

    /** 
     * @override
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 560,
            height: 500,
            classes: ["nephilim", "sheet", "item"]
        });
    }

    /** 
     * @override
     */
    get template() {
        return `systems/neph5e/feature/analogie/item/habitus.html`;
    }

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.item-drop-target').on("drop", this._onDrop.bind(this));
        html.find('.delete-voie').click(this._onDelete.bind(this));
    }

    /**
     * This function catches the drop on a sort. The dropped item can be
     *   - une voie magique
     * @param event The drop event.
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
        let size = this.item.system.voies == null ? 0 : this.item.system.voies.length;
        const voies = [];
        for (let index = 0; index < size; index++) {
            const name = "system.voies.[" + index + "]";
            voies.push(formData[name]);
            delete formData[name];
        }
        formData["system.voies"] = voies;

        // Update object
        super._updateObject(event, formData);
    }

}