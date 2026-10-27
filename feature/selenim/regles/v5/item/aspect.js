import { NephilimItemSheet } from "../../../../../module/item/nephilimItemSheet.js";

export class AspectSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-aspect"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/selenim/regles/v5/item/aspect.html`,
        }
    }

}