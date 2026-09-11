
import { Constants } from "../../../module/common/constants.js";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class AppelSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-appel"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/conjuration/item/appel.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                cercles: super.cerclesOf('conjuration'),
                appels: Constants.APPELS,
            }
        }
    }

}