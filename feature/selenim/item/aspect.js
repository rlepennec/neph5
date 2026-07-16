import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class AspectSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-aspect"],
        position: {
            width: 850,
            height: 700
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/selenim/item/aspect.html`,
        }
    }

}