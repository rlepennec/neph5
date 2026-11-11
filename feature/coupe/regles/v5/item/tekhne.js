import { Science } from "../../../../science/regles/v5/science.js";
import { NephilimItemSheet } from "../../../../../module/item/nephilimItemSheet.js";

export class TekhneSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-tekhne"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/coupe/regles/v5/item/tekhne.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                cercles: Science.cerclesNommes('coupe')
            }
        }
    }

}