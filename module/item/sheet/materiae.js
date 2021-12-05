import { NephilimItemSheet } from "./base.js";
import { Game } from "../../common/game.js";

export class MateriaeSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.elements = Game.pentacle.elements;
        return data;
    }

    /** 
     * @override
     */
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 560,
            height: 400,
            classes: ["nephilim", "sheet", "item"],
            resizable: true,
            scrollY: [".tab.description"],
            tabs: [{navSelector: ".tabs", contentSelector: ".sheet-body", initial: "description"}]
      });
    }

}