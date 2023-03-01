import { Game } from "../../../module/common/game.js";
import { NephilimItemSheet } from "../../../module/item/base.js";
import { Science } from "../../science/science.js";

export class InvocationSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.elements = Game.kabbale.elements;
        data.cercles = Science.cerclesOf('kabbale');
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