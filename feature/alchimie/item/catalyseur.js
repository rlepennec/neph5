import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class CatalyseurSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-catalyseur"],
        position: {
            width: 850,
            height: 650
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/alchimie/item/catalyseur.html`,
        }
    }

}