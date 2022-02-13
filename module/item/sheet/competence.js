import { NephilimItemSheet } from "./base.js";
import { CustomHandlebarsHelpers } from "../../common/handlebars.js";
import { Game } from "../../common/game.js";

export class CompetenceSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.debug = game.settings.get('neph5e', 'debug');
        data.elements = Game.pentacle.elements;
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

        const vecus = [];
        for (let vecu of actor.items.filter(i => i.type === 'vecu')) {
            for (let c of vecu.data.data.competences) {
                if (c.refid === id) {
                    vecus.push(vecu);
                    break;
                }
            }
        }

        const degre = actor.getCompetence(item);
        const sapience = actor.getCompetenceSum(item);
        const next = CustomHandlebarsHelpers.getSapiences(degre + 1) - sapience;

        // Create the dialog panel to display.
        const html = await renderTemplate("systems/neph5e/templates/item/competence.html", {
            item: item,
            debug: game.settings.get('neph5e', 'debug'),
            vecus: vecus,
            degre: degre,
            sapience: sapience,
            next: next,
            elements: Game.pentacle.elements
        });

        // Display the action panel
        await new Dialog({
            title: game.i18n.localize('ITEM.TypeCompetence'),
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