import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class SavoirSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-savoir"],
        position: {
            width: 900,
            height: 750
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/savoir/item/savoir.html`,
        }
    }

}