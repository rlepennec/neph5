import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";
import { Game } from "../../../module/common/game.js";
import { NephilimItemSheet } from "../../../module/item/base.js";

export class RiteSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.cercles = super.cerclesOf('necromancie');
        data.desmos = Game.necromancie.desmos;
        return data;
    }

    /** 
     * @override
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
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