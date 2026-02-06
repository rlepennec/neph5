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
        }
    }

    async _prepareContext(options) {
        const context = {
            ...await super._prepareContext(options),
            context: {
                vecus: new DocumentReferences('Item', 'vecu', this.document)
            }
        };
        return context;
    }

}