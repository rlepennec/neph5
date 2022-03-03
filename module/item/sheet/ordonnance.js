import { NephilimItemSheet } from "./base.js";
import { Game } from "../../common/game.js";
import { CustomHandlebarsHelpers } from "../../common/handlebars.js";

export class OrdonnanceSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.mondes = Game.kabbale.mondes;
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

    static async onEdit(event) {

        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = CustomHandlebarsHelpers.getItem(id);

        // Create the dialog panel to display.
        const html = await renderTemplate("systems/neph5e/templates/item/ordonnance.html", {
            item: item,
            data: item.data.data,
            debug: game.settings.get('neph5e', 'debug'),
            difficulty: 0
        });

        // Display the action panel
        await new Dialog({
            title: game.i18n.localize('ITEM.TypeOrdonnance'),
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