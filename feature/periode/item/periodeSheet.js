import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class PeriodeSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        id: "periode",
        classes: ["periode"],
        position: {
            height: 500,
            width: 590,
        },
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/periode/item/periodeSheet.html`,
        }
    }

}