import { NephilimItemSheet } from "../../../module/item/base.js";

export class ScienceSheet extends NephilimItemSheet {

/*
            resizable: true,
            scrollY: [".tab.description"],
            tabs: [{navSelector: ".sheet-navigation", contentSelector: ".article-body", initial: "description"}]
*/

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