import { NephilimItemSheet } from "../../../module/item/base.js";

export class MagieSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 700,
            height: 400
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/magie/item/magie.html`,
        }
    }

}