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
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                cercles: super.cerclesOf('dracomachie')
            }
        }
    }

    /**
     * @override
     */
    async _onSubmit(event, form, formData) {

        // Set element for passes
        if (formData.object["system.cercle"] === "dracomachie@passes" || formData.object["system.cercle"] === "dracomachie@charmes") {
            formData.object['system.element'] = "choix"
        } else {
            formData.object['system.element'] = new foundry.data.operators.ForcedDeletion();
            formData.object['system.degre'] = new foundry.data.operators.ForcedDeletion();
        }

        // Update object
        await this.document.update(formData.object);
    }

}