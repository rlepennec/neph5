import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { MetamorpheData } from "./metamorpheData.mjs";

export class MetamorpheSheet extends NephilimItemSheet {

    static #ID = 'metamorphe';

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

    /**
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                elements: MetamorpheData.defineSchema().element.choices,
                humeurs: MetamorpheData.defineSchema().humeur.choices,
            }
        }
    }

    /**
     * @override
     */
    _updateObject(event, formData) {

        // Update metamorphoses
        const v5 = [];
        for (let index = 0; index < 10; index++) {
            const name = "system.metamorphoses.v5.[" + index + "]";
            v5.push({ name: formData[name + ".name"] });
            delete formData[name + ".name"];
        }
        formData["system.metamorphoses.v5"] = v5;

        // Update object
        super._updateObject(event, formData);
    }

}