import { NephilimItemSheet } from "../../../module/item/base.js";

export class AlchimieSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        id: "alchimie",
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/alchimie/item/alchimie.html`,
        }
    }

}