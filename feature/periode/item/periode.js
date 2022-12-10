import { NephilimItemSheet } from "../../../module/item/base.js";
import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";

export class PeriodeSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.vecus = this._getVecus(data.system.id);
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
        return `systems/neph5e/feature/periode/item/periode.html`;
    }

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.item-drop-target').on("drop", this._onDrop.bind(this));
        html.find('.edit-vecu').click(this.onEdit.bind(this));
        html.find('.delete-vecu').click(this._onDeleteVecu.bind(this));
    }

    /**
     * This function catches the drop on a periode. The dropped item can be
     *   - a vecu
     * @param event The drop event.
     */
    async _onDrop(event) {
        event.preventDefault();
        const drop = await NephilimItemSheet.droppedItem(event.originalEvent);
        if (drop?.type === "vecu") {
            const vecu = CustomHandlebarsHelpers.getItem(drop.sid);
            await vecu.update({ ['system.periode']: this.item.sid });
            await this.render(true);
        }
    }

    /**
     * This function catches the deletion of a vecu from the list of vecus.
     */
    async _onDeleteVecu(event) {
        event.preventDefault();
        const li = $(event.currentTarget).closest(".item");
        const id = li.data("item-id");
        const vecu = CustomHandlebarsHelpers.getItem(id);
        await vecu.update({ ['system.periode']: "" });
        await this.render(true);
    }

    /**
     * Gets the vecus of the specified periode.
     * @param periode The uuid of the periode.
     * @return the array of the uuid od the vecus.
     */
    _getVecus(periode) {
        const vecus = [];
        for (let vecu of game.items.filter(i => i.type === 'vecu' && i.system.periode === periode)) {
            vecus.push(vecu.sid);
        }
        return vecus;
    }

}