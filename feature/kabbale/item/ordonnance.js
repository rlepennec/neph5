import { NephilimItemSheet } from "../../../module/item/base.js";
import { Game } from "../../../module/common/game.js";

export class OrdonnanceSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getOriginalData() {
        return {
            mondes: Game.kabbale.mondes
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
        return `systems/neph5e/feature/kabbale/item/ordonnance.html`;
    }

}