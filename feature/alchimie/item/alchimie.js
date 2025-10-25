import { NephilimItemSheet } from "../../../module/item/base.js";

export class AlchimieSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        id: "alchimie",
        classes: ["nephilim", "sheet", "item", "alchimie"],
        position: {
            height: 400,
            width: 560,
        },
        form: {
            handler: AlchimieSheet.#onSubmit,
            closeOnSubmit: true,
            submitOnChange: false,
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

    static #onSubmit(event, form, formData) {
        console.log("onSubmit");
    }

    _onRender(context, options) {
        console.log("_onRender");
    }

}