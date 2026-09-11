import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class CapaciteSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-capacite"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/capacite/item/capacite.html`,
        }
    }

}