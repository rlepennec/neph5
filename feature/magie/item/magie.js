import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class MagieSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-magie"],
        position: {
            width: 850,
            height: 650
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/magie/item/magie.html`,
        }
    }

}