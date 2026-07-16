import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class PratiqueSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-pratique"],
        position: {
            width: 950,
            height: 700
        }
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