import { Constants } from "../../../module/common/constants.js";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class MetamorpheSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 1400,
            height: 820
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/nephilim/item/metamorphe.html`,
        }
    }

    /**
     * Le bandeau de la fenêtre est hors de .item-root : on applique le skin
     * du Ka sur la fenêtre elle-même pour qu'il en hérite les variables.
     * @override
     */
    async _onRender(context, options) {
        await super._onRender(context, options);
        this.element.classList.remove(...Constants.ELEMENTS.map(e => `skin-${e}`));
        const element = this.document.system.element;
        if (element) this.element.classList.add(`skin-${element}`);
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                elements: Constants.ELEMENTS
            }
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