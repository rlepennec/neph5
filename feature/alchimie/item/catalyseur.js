import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class CatalyseurSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-catalyseur"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/alchimie/item/catalyseur.html`,
        }
    }

}