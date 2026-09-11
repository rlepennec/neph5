import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class MagieSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-magie"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/magie/item/magie.html`,
        }
    }

}