import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";

export class QueteSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 500
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/quete/item/quete.html`,
        }
    }

}