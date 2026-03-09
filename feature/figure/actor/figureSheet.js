import { Incarnation } from "../../incarnation/item/incarnation.js"
import { NephilimActorSheet } from "../../../module/nephilimActorSheet.js";

export class FigureSheet extends NephilimActorSheet {

    static #ID = 'figure';

    static DEFAULT_OPTIONS = {
        classes: [this.#ID],
        position: {
            height: 500,
            width: 590,
        },
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/${this.#ID}/actor/${this.#ID}Sheet.hbs`,
        },
    }

    static TABS = {
        primary: {
            tabs: [
                { 
                    id: "description",
                    template: `systems/neph5e/feature/${this.#ID}/actor/descriptionSheet.hbs`
                },
                {
                    id: "vecu",
                    template: `systems/neph5e/feature/${this.#ID}/actor/vecuSheet.hbs`
                }
            ],
            initial: "description"
        },
    }

    async _prepareContext(options) {
        const context = {
            ...await super._prepareContext(options),
            tabs: this._prepareTabs("primary"),
            context: {
                incarnations: this.#incarnations()
            }
        };
        return context;
    }

    async _preparePartContext(partId, context) {
        switch (partId) {
            case 'description':
            case 'vecu':
                context.tab = context.tabs[partId];
                break;
            default:
        }
        return context;
    }

    #incarnations() {
        let array = [];
        for (const sid of this.document.system.base.incarnations) {
            const item = this.document.items.find(i => i.type === "incarnation" && i.system.sid === sid);
            const incarnation = new Incarnation(item);
            array.push({
                name: incarnation.name,
                id: incarnation.id
            });
        }
        return array;
    }

}