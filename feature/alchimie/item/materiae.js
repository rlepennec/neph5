import { Game } from "../../../module/common/game.js";
import { NephilimItemSheet } from "../../../module/item/base.js";

export class MateriaeSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getOriginalData() {
        return {
            elements: Game.pentacle.elements
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
        return `systems/neph5e/feature/alchimie/item/materiae.html`;
    }

}