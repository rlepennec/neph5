import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class AlchimieSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-alchimie"],
        position: {
            width: 850,
            height: 650
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/alchimie/item/alchimie.html`,
        }
    }

}