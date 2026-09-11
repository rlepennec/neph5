import { MateriaeDataModel } from "./materiae.mjs";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class MateriaeSheet extends NephilimItemSheet {

    // Taille d'ouverture : voir module/item/positions.js (elle depend du style).

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/alchimie/item/materiae.html`,
        }
    }

    /**
     * @override
     */
    async _onRender(context, options) {
        await super._onRender(context, options);
        this.applySkin(this.document.system.element);
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                elements: MateriaeDataModel.defineSchema().element.choices,
            }
        }
    }

}