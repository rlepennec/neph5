import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { DocumentReferences } from "../../../module/document/documentReferences.js";

export class PeriodeSheet extends NephilimItemSheet {

    static #ID = 'periode';

    static DEFAULT_OPTIONS = {
        id: this.#ID,
        classes: [this.#ID],
        position: {
            height: 500,
            width: 590,
        },
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/${this.#ID}/item/${this.#ID}Sheet.html`,
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