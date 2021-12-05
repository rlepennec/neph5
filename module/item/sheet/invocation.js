import { NephilimItemSheet } from "./base.js";
import { Game } from "../../common/game.js";

export class InvocationSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.elements = Game.kabbale.elements;
        data.cercles = Game.kabbale.cercles;
        data.mondes = Game.kabbale.mondes;
        data.sephiroth = Game.kabbale.sephiroth;
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