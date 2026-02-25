import { CompetenceData } from "./competenceData.mjs";
import { NephilimItemSheet } from "../../../module/nephilimItemSheet.js";

export class CompetenceSheet extends NephilimItemSheet {

    static #ID = 'competence';

    static DEFAULT_OPTIONS = {
        classes: [this.#ID],
        position: {
            height: 500,
            width: 590,
        },
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
                elements: CompetenceData.defineSchema().base.fields.element.choices,
            }
        }
    }

}