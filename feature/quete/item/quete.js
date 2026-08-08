import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";

export class QueteSheet extends NephilimItemSheet {

    /**
     * La quête n'est pas éditable lorsqu'il est ouvert depuis un acteur.
     * @override
     */
    get editableFromActor() {
        return false;
    }

    static DEFAULT_OPTIONS = {
        classes: ["vk-quete"],
        position: {
            width: 850,
            height: 750
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/quete/item/quete.html`,
        }
    }

}