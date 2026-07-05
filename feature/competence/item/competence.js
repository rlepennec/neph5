import { CompetenceDataModel } from "./competence.mjs";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { Game } from "../../../module/common/game.js";

export class CompetenceSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 500
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/competence/item/competence.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                elements: CompetenceDataModel.defineSchema().element.choices,
            }
        }
    }

}