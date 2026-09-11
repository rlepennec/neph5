import { Constants } from "../../../module/common/constants.js";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class RiteSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-rite"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/necromancie/item/rite.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                cercles: super.cerclesOf('necromancie'),
                desmos: Constants.DESMOS,
            }
        }
    }

}