import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class VecuSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        id: "vecu",
        classes: ["vecu"],
        position: {
            height: 500,
            width: 590,
        },
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/vecu/item/vecuSheet.html`,
        }
    }

}