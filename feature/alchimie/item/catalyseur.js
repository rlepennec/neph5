import { NephilimItemSheet } from "../../../module/item/base.js";

export class CatalyseurSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 500
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/alchimie/item/catalyseur.html`,
        }
    }

}