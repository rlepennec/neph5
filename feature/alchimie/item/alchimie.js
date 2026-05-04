import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class AlchimieSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 400,
            height: 560
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/alchimie/item/alchimie.html`,
        }
    }

}