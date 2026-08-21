import { Constants } from "../../../module/common/constants.js";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class RiteSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-rite"],
        position: {
            width: 1220,
            height: 720
        }
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