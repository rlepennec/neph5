import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";
import { Game } from "../../../module/common/game.js";
import { NephilimItemSheet } from "../../../module/item/base.js";

export class RiteSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getOriginalData() {
        return {
            cercles: super.cerclesOf('necromancie'),
            desmos: Game.necromancie.desmos
        }
    }

    /** 
     * @override
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 560,
            height: 500,
            classes: ["nephilim", "sheet", "item"]
        });
    }

    /** 
     * @override
     */
    get template() {
        return `systems/neph5e/feature/necromancie/item/rite.html`;
    }

}