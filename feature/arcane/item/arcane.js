import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class ArcaneSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-arcane"],
        position: {
            width: 850,
            height: 700
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/arcane/item/arcane.html`,
        }
    }

}