import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class TechniqueSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-technique"],
        position: {
            width: 1220,
            height: 720
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/baton/item/technique.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                cercles: super.cerclesOf('baton')
            }
        }
    }

}