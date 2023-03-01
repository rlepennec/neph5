
import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";
import { NephilimItemSheet } from "../../../module/item/base.js";
import { Game } from "../../../module/common/game.js";

export class AppelSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.cercles = super.cerclesOf('conjuration');
        data.appels = Game.conjuration.appels;
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
        return `systems/neph5e/feature/conjuration/item/appel.html`;
    }

}