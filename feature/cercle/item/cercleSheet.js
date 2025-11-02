import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class CercleSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        id: "cercle",
        classes: ["cercle"],
        position: {
            height: 500,
            width: 590,
        },
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/cercle/item/cercleSheet.html`,
        }
    }

}