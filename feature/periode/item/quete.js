import { NephilimItemSheet } from "../../../module/item/base.js";
import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";

export class QueteSheet extends NephilimItemSheet {

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
        return `systems/neph5e/feature/periode/item/quete.html`;
    }

    static async onEdit(event, actor) {

        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = CustomHandlebarsHelpers.getItem(id);

        const periodes = [];
        for (let periode of actor.system.periodes.filter(p => p.active === true)) {
            for (let quete of periode.quetes.filter(s => s.refid === id)) {
                if (quete.refid === id) {
                    const periodeItem = CustomHandlebarsHelpers.getItem(periode.refid);
                    periodes.push({name: periodeItem?.name, degre: quete.degre});
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
        const html = await renderTemplate("systems/neph5e/templates/item/quete.html", {
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
            title: game.i18n.localize('ITEM.TypeQuete'),
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