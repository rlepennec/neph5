import { Game } from "../../../module/common/game.js";
import { MateriaeDataModel } from "./materiae.mjs";
import { NephilimItemSheet } from "../../../module/item/base.js";

export class MateriaeSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 500
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/alchimie/item/materiae.html`,
        }
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