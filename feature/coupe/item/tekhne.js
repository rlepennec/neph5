import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class TekhneSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-tekhne"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/coupe/item/tekhne.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                cercles: super.cerclesOf('coupe')
            }
        }
    }

}