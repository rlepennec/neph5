import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class DivinationSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-divination"],
        position: {
            width: 950,
            height: 700
        }
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