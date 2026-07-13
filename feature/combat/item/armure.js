import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class ArmureSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-orichalque"],
        position: {
            width: 750,
            height: 800
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/combat/item/armure.html`,
        }
    }

}