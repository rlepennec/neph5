import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class CapaciteSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-capacite"],
        position: {
            width: 850,
            height: 680
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/capacite/item/capacite.html`,
        }
    }

}