import { NephilimItemSheet } from "./base.js";
import { Game } from "../../common/game.js";

export class OrdonnanceSheet extends NephilimItemSheet {

    /**
     * @constructor
     * @param  {...any} args
     */
    constructor(...args) {
        super(...args);

    }

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.mondes = Game.kabbale.mondes;
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

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
    }

}