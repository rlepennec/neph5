import { NephilimItemSheet } from "../../../../../module/item/nephilimItemSheet.js";
import { OrdonnanceDataModel } from "../../../item/ordonnance.mjs";

export class OrdonnanceSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-ordonnance"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/kabbale/regles/v5/item/ordonnance.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                mondes: OrdonnanceDataModel.defineSchema().versions.fields.v5.fields.monde.choices,
            }
        }
    }

}