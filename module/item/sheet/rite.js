import { NephilimItemSheet } from "./base.js";
import { Game } from "../../common/game.js";

export class RiteSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.debug = game.settings.get('neph5e', 'debug');
        data.cercles = Game.necromancie.cercles;
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

}