import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class ArcaneSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-arcane"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/arcane/item/arcane.html`,
        }
    }

}