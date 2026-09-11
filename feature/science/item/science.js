import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class ScienceSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-science"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/science/item/science.html`,
        }
    }

}