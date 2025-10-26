import { NephilimItemSheet } from "../../../module/item/base.js";

export class CercleSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        id: "cercle",
        classes: ["nephilim", "sheet", "item", "cercle"],
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
            template: `systems/neph5e/feature/cercle/item/cercle.html`,
        }
    }

}