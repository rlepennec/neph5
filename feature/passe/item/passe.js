import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class PasseSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-passe"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/passe/item/passe.html`,
        }
    }

}