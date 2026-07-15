import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class PasseSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-passe"],
        position: {
            width: 850,
            height: 700
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/passe/item/passe.html`,
        }
    }

}