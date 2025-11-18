import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { DocumentReferences } from "../../../module/document/documentReferences.js";

export class VecuSheet extends NephilimItemSheet {

    static #ID = 'vecu';

    static DEFAULT_OPTIONS = {
        id: this.#ID,
        classes: [this.#ID],
        position: {
            height: 500,
            width: 590,
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/${this.#ID}/item/${this.#ID}Sheet.html`,
        }
    }

    async _prepareContext(options) {
        const context = {
            ...await super._prepareContext(options),
            sheet: {
                periode: new DocumentReferences('Item', 'periode', this.document),
                competences: new DocumentReferences('Item', 'competence', this.document)
            }
        };
        return context;
    }

}