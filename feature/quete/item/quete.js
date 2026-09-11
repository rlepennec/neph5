import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class QueteSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-quete"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/quete/item/quete.html`,
        }
    }

}