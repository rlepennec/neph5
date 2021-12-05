import { NephilimItemSheet } from "./base.js";
import { Game } from "../../common/game.js";

export class RiteSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
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
            height: 600,
            classes: ["nephilim", "sheet", "item"],
            resizable: true,
            scrollY: [".tab.description"],
            tabs: [{navSelector: ".tabs", contentSelector: ".sheet-body", initial: "description"}]
      });
    }

}