import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class TekhneSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-tekhne"],
        position: {
            width: 1220,
            height: 720
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