import { NephilimActorSheet } from "../../../module/actor/nephilimActorSheet.js";
import { DocumentReferences } from "../../../module/document/documentReferences.js";

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

    _prepareTabs2(g) {



        const group = this.constructor.TABS[g];
        const tabs = group.tabs;
        tabs.forEach(t => {
            t.group = g;
            t.label = t.id;
            t.active = t.id === this.tabGroups[g];
        });
        return tabs;
    }


   

/*  */

    async _prepareContext(options) {
        const context = {
            ...await super._prepareContext(options),
            tabs: this._prepareTabs2("primary", this.tabGroups),
            context: {
                vecus: new DocumentReferences('Item', 'vecu', this.document)
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


}