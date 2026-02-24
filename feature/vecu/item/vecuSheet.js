import { DocumentReferences } from "../../../module/document/documentReferences.js"
import { NephilimItemSheet } from "../../../module/nephilimItemSheet.js";
import { VecuData } from "./vecuData.mjs";

export class VecuSheet extends NephilimItemSheet {

    static #ID = 'vecu';

    static DEFAULT_OPTIONS = {
        classes: [this.#ID],
        position: {
            height: 500,
            width: 590,
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/${this.#ID}/item/${this.#ID}Sheet.hbs`,
        }
    }

    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                elements: VecuData.defineSchema().base.fields.element.choices,
                periode: new DocumentReferences('Item', 'periode', this.document),
                competences: new DocumentReferences('Item', 'competence', this.document)
            }
        }
    }

}