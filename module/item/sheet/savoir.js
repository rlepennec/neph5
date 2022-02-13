import { NephilimItemSheet } from "./base.js";
import { CustomHandlebarsHelpers } from "../../common/handlebars.js";

export class SavoirSheet extends NephilimItemSheet {

    /** 
     * @override
     */
     getData() {
        const data = super.getData();
        data.debug = game.settings.get('neph5e', 'debug');
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

        const periodes = [];
        for (let periode of actor.data.data.periodes.filter(p => p.active === true)) {
            for (let savoir of periode.savoirs.filter(s => s.refid === id)) {
                if (savoir.refid === id) {
                    const periodeItem = CustomHandlebarsHelpers.getItem(periode.refid);
                    periodes.push({name: periodeItem?.name, degre: savoir.degre});
                    break;
                }
            }
        }

        let degre = 0;
        for (let p of periodes) {
            degre = degre + p.degre;
        }

        const sapience = CustomHandlebarsHelpers.getSapiences(degre);
        const next = CustomHandlebarsHelpers.getSapiences(degre + 1) - sapience;

        // Create the dialog panel to display.
        const html = await renderTemplate("systems/neph5e/templates/item/savoir.html", {
            item: item,
            debug: game.settings.get('neph5e', 'debug'),
            periodes: periodes,
            degre: degre,
            sapience: sapience,
            next: next,
            difficulty: item.difficulty(actor)
        });

        // Display the action panel
        await new Dialog({
            title: game.i18n.localize('ITEM.TypeSavoir'),
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