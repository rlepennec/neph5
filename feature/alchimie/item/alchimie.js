import { NephilimItemSheet } from "../../../module/item/base.js";

export class AlchimieSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 400,
            height: 560
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/alchimie/item/alchimie.html`,
        }
    }

    static #onSubmit(event, form, formData) {
        console.log(event);
        console.log(form);
        console.log(formData);
        console.log("onSubmit");
    }

    _onRender(context, options) {
        console.log("_onRender");
    }

}