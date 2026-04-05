import { NephilimItemSheet } from "../../../module/item/base.js";

export class DracomachieSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 500
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/dracomachie/item/dracomachie.html`,
        }
    }

    /** 
     * @override
     */
    getOriginalData() {
        return {
            cercles: super.cerclesOf('dracomachie')
        }
    }

    /**
     * @override
     */
    _updateObject(event, formData) {

        // Set element for passes
        if (formData["system.cercle"] === "dracomachie@passes" || formData["system.cercle"] === "dracomachie@charmes") {
            formData['system.element'] = "choix"
        } else {
            formData['system.element'] = new foundry.data.operators.ForcedDeletion();
            formData['system.degre'] = new foundry.data.operators.ForcedDeletion();
        }

        // Update object
        super._updateObject(event, formData);
    }

}