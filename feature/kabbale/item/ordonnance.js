import { Game } from "../../../module/common/game.js";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { OrdonnanceDataModel } from "./ordonnance.mjs";

export class OrdonnanceSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 500
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/kabbale/item/ordonnance.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                mondes: OrdonnanceDataModel.defineSchema().monde.choices,
            }
        }
    }

}