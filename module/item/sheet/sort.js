import { NephilimItemSheet } from "./base.js";
import { CustomHandlebarsHelpers } from "../../common/handlebars.js";
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
        html.find('.delete-voie').click(this._onDelete.bind(this));
    }

    /**
     * This function catches the drop on a voie.
     * @param {*} event 
     */
    async _onDrop(event) {
        event.preventDefault();
        const drop = await droppedItem(event.originalEvent);
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

    static async onEdit(event, actor) {

        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = CustomHandlebarsHelpers.getItem(id);

        // Create the dialog panel to display.
        const html = await renderTemplate("systems/neph5e/templates/item/sort.html", {
            item: item,
            data: item.data.data,
            debug: game.settings.get('neph5e', 'debug'),
            elements: Game.elements,
            cercles: Game.magie.cercles,
            difficulty: item.difficulty(actor)
        });

        // Display the action panel
        await new Dialog({
            title: game.i18n.localize('ITEM.TypeSort'),
            content: html,
            buttons: {},
            default: null,
            close: () => {}

        }, {
            width: 560,
            height: 500
        }).render(true);

    }

}