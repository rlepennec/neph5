import { NephilimItemSheet } from "./base.js";

export class ArmureSheet extends NephilimItemSheet {

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