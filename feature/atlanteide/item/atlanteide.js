import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class AtlanteideSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-atlanteide"],
        position: {
            width: 1220,
            height: 720
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/atlanteide/item/atlanteide.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                cercles: super.cerclesOf('atlanteide')
            }
        }
    }

}