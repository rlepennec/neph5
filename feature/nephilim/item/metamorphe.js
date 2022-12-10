import { NephilimItemSheet } from "../../../module/item/base.js";
import { Game } from "../../../module/common/game.js";

export class MetamorpheSheet extends NephilimItemSheet {

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
            height: 800,
            classes: ["nephilim", "sheet", "item"]
      });
    }

    /** 
     * @override
     */
    get template() {
        return `systems/neph5e/feature/nephilim/item/metamorphe.html`;
    }

    /**
     * @override
     */
    _updateObject(event, formData) {

        // Update metamorphoses
        const metamorphoses = [];
        for (let index = 0; index < 10; index++) {
            const name = "system.metamorphoses.[" + index + "]";
            metamorphoses.push({ name: formData[name + ".name"] });
            delete formData[name + ".name"];
        }
        formData["system.metamorphoses"] = metamorphoses;

        // Update object
        super._updateObject(event, formData);
    }

}