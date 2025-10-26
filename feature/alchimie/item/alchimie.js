import { NephilimItemSheet } from "../../../module/item/base.js";

export class AlchimieSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        id: "alchimie",
        classes: ["nephilim", "sheet", "item", "alchimie"],
        position: {
            height: 500,
            width: 590,
        },
        form: {
            closeOnSubmit: false,
            submitOnChange: true,
        },
        editable: true,
        tag: "form",
        window: {
            resizable: true,
        },
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/alchimie/item/alchimie.html`,
        }
    }

}