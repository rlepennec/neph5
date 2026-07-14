import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class ScienceSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-science"],
        position: {
            width: 820,
            height: 620
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/science/item/science.html`,
        }
    }

}