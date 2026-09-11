import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class ChuteSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-chute"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/chute/item/chute.html`,
        }
    }

}