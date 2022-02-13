import { NephilimItemSheet } from "./base.js";
import { CustomHandlebarsHelpers } from "../../common/handlebars.js";

export class AspectSheet extends NephilimItemSheet {

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

    static async onEdit(event) {

        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = CustomHandlebarsHelpers.getItem(id);

        // Create the dialog panel to display.
        const html = await renderTemplate("systems/neph5e/templates/item/aspect.html", {
            item: item,
            data: item.data.data,
            debug: game.settings.get('neph5e', 'debug'),
            difficulty: 0
        });

        // Display the action panel
        await new Dialog({
            title: game.i18n.localize('ITEM.TypeAspect'),
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