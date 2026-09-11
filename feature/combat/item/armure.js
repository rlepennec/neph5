import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class ArmureSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-armure"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/combat/item/armure.html`,
        }
    }

}