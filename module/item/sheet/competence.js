import { NephilimItemSheet } from "./base.js";
import { Game } from "../../common/game.js";

export class CompetenceSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.innes = Game.simulacre.innes;
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