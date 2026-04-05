import { NephilimItemSheet } from "../../../module/item/base.js";

export class ScienceSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 400
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/science/item/science.html`,
        }
    }

}