import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class TekhneSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-tekhne"],
        position: {
            width: 950,
            height: 700
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/coupe/item/tekhne.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                cercles: super.cerclesOf('coupe')
            }
        }
    }

}