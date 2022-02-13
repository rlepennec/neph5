import { NephilimItemSheet } from "./base.js";
import { CustomHandlebarsHelpers } from "../../common/handlebars.js";
import { Game } from "../../common/game.js";

export class AppelSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.cercles = Game.conjuration.cercles;
        data.appels = Game.conjuration.appels;
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

    static async onEdit(event, actor) {

        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = CustomHandlebarsHelpers.getItem(id);

        // Create the dialog panel to display.
        const html = await renderTemplate("systems/neph5e/templates/item/appel.html", {
            item: item,
            data: item.data.data,
            debug: game.settings.get('neph5e', 'debug'),
            cercles: Game.conjuration.cercles,
            appels: Game.conjuration.appels,
            difficulty: item.difficulty(actor)
        });

        // Display the action panel
        await new Dialog({
            title: game.i18n.localize('ITEM.TypeAppel'),
            content: html,
            buttons: {},
            default: null,
            close: () => {}

        }, {
            width: 600,
            height: 500
        }).render(true);

    }

}