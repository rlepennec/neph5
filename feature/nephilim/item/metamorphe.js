import { NephilimItemSheet } from "../../../module/item/base.js";
import { Game } from "../../../module/common/game.js";

export class MetamorpheSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 800
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/nephilim/item/metamorphe.html`,
        }
    }

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