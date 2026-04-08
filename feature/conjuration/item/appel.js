
import { Constants } from "../../../module/common/constants.js";
import { NephilimItemSheet } from "../../../module/item/base.js";

export class AppelSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 500
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