import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class RituelSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-rituel"],
        position: {
            width: 950,
            height: 700
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/epee/item/rituel.html`,
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