
import { Constants } from "../../../module/common/constants.js";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class AppelSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-appel"],
        position: {
            width: 1220,
            height: 720
        }
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