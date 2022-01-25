import { NephilimItemSheet } from "./base.js";
import { droppedItem } from "../../common/tools.js";
import { CustomHandlebarsHelpers } from "../../common/handlebars.js";

export class PeriodeSheet extends NephilimItemSheet {

    /** 
     * @override
     */
     getData() {
        const data = super.getData();
        data.debug = game.settings.get('neph5e', 'debug');
        data.vecus = this._getVecus(data.data.id);
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
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.tbd').on("drop", this._onDrop.bind(this));
        html.find('.edit-vecu').click(this.onEdit.bind(this));
        html.find('.delete-vecu').click(this._onDeleteVecu.bind(this));
    }

    /**
     * This function catches the drop on the vecu list
     * @param {*} event 
     */
    async _onDrop(event) {
        event.preventDefault();
        const drop = await droppedItem(event.originalEvent);
        if (drop?.data?.type === "vecu") {
            const vecu = CustomHandlebarsHelpers.getItem(drop.data.data.id);
            await vecu.update({ ['data.periode']: this.item.data.data.id });
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
        await vecu.update({ ['data.periode']: "" });
        await this.render(true);
    }

    /**
     * Gets the vecus of the specified periode.
     * @param {} Periode The uuid of the periode.
     * @return the array of the uuid od the vecus.
     */
    _getVecus(periode) {
        const vecus = [];
        for (let vecu of game.items.filter(i => i.type === 'vecu' && i.data.data.periode === periode)) {
            vecus.push(vecu.data.data.id);
        }
        return vecus;
    }

}