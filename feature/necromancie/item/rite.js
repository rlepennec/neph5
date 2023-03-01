import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";
import { Game } from "../../../module/common/game.js";
import { NephilimItemSheet } from "../../../module/item/base.js";
import { Science } from "../../science/science.js";

export class RiteSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.cercles = Science.cerclesOf('necromancie');
        data.desmos = Game.necromancie.desmos;
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
        return `systems/neph5e/feature/necromancie/item/rite.html`;
    }

    static async onEdit(event, actor) {

        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = CustomHandlebarsHelpers.getItem(id);

        // Create the dialog panel to display.
        const html = await renderTemplate("systems/neph5e/feature/necromancie/item/rite.html", {
            item: item,
            data: item.system,
            debug: game.settings.get('neph5e', 'debug'),
            cercles: Game.necromancie.cercles,
            desmos:Game.necromancie.desmos,
            difficulty: item.difficulty(actor)
        });

        // Display the action panel
        await new Dialog({
            title: game.i18n.localize('ITEM.TypeRite'),
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