import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class PratiqueSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-pratique"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/denier/item/pratique.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                cercles: super.cerclesOf('denier')
            }
        }
    }

}