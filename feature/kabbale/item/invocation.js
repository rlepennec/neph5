import { Game } from "../../../module/common/game.js";
import { NephilimItemSheet } from "../../../module/item/base.js";

export class InvocationSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getOriginalData() {
        return {
            elements: Game.kabbale.elements,
            cercles: super.cerclesOf('kabbale'),
            mondes: Game.kabbale.mondes,
            sephiroth: Game.kabbale.sephiroth
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
        return `systems/neph5e/feature/kabbale/item/invocation.html`;
    }

}