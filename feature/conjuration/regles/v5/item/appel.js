import { Science } from "../../../../science/regles/v5/science.js";

import { Constants } from "../../../../../module/common/regles/v5/constants.js";
import { NephilimItemSheet } from "../../../../../module/item/nephilimItemSheet.js";

export class AppelSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-appel"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/conjuration/regles/v5/item/appel.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                cercles: Science.cerclesNommes('conjuration'),
                appels: Constants.APPELS,
            }
        }
    }

}