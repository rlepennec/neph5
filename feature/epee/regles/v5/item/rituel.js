import { NephilimItemSheet } from "../../../../../module/item/nephilimItemSheet.js";

export class RituelSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-rituel"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/epee/regles/v5/item/rituel.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                cercles: super.cerclesOf('epee')
            }
        }
    }

}