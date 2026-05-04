import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class ArmureSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 500
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/combat/item/armure.html`,
        }
    }

}