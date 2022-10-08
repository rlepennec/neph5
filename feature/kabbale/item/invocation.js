import { NephilimItemSheet } from "../../../module/item/base.js";
import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";
import { Game } from "../../../module/common/game.js";

export class InvocationSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.elements = Game.kabbale.elements;
        data.cercles = Game.kabbale.cercles;
        data.mondes = Game.kabbale.mondes;
        data.sephiroth = Game.kabbale.sephiroth;
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
        return `systems/neph5e/feature/kabbale/item/invocation.html`;
    }

    static async onEdit(event, actor) {

        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = CustomHandlebarsHelpers.getItem(id);

        // Create the dialog panel to display.
        const html = await renderTemplate("systems/neph5e/feature/kabbale/item/invocation.html", {
            item: item,
            system: item.system,
            debug: game.settings.get('neph5e', 'debug'),
            elements: Game.kabbale.elements,
            cercles: Game.kabbale.cercles,
            mondes: Game.kabbale.mondes,
            sephiroth: Game.kabbale.sephiroth,
            difficulty: item.difficulty(actor)
        });

        // Display the action panel
        await new Dialog({
            title: game.i18n.localize('ITEM.TypeInvocation'),
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