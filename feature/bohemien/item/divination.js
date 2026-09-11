import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class DivinationSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-divination"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/bohemien/item/divination.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                cercles: super.cerclesOf('bohemien')
            }
        }
    }

}