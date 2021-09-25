import { NephilimItemSheet } from "./base.js";
import { Game } from "../../common/game.js";

export class MetamorpheSheet extends NephilimItemSheet {

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

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
    }

        /**
     * @override
     */
    _updateObject(event, formData) {

        // Update metamorphoses
        let size = this.item.data.data.metamorphoses.length;
        const metamorphoses = [];
        for (let index = 0; index < size; index++) {
            const name = "data.metamorphoses.[" + index + "]";
            metamorphoses.push({ name: formData[name + ".name"] });
            delete formData[name + ".name"];
        }
        formData["data.metamorphoses"] = metamorphoses;

        // Update object
        super._updateObject(event, formData);
    }

}