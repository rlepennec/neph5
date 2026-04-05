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
    async _onSubmit(event, form, formData) {

        // Update metamorphoses
        const metamorphoses = [];
        for (let index = 0; index < 10; index++) {
            const name = "system.metamorphoses.[" + index + "]";
            metamorphoses.push({ name: formData.object[name + ".name"] });
            delete formData.object[name + ".name"];
        }
        formData.object["system.metamorphoses"] = metamorphoses;

        // Update object
        await this.document.update(formData.object);
    }

}