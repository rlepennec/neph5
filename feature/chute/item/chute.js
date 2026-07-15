import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class ChuteSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-chute"],
        position: {
            width: 850,
            height: 700
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/chute/item/chute.html`,
        }
    }

}