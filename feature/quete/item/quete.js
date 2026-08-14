import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";

export class QueteSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-quete"],
        position: {
            width: 900,
            height: 750
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/quete/item/quete.html`,
        }
    }

}