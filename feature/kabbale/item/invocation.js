import { Constants } from "../../../module/common/constants.js";
import { InvocationDataModel } from "./invocation.mjs";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class InvocationSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 1000,
            height: 700
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/kabbale/item/invocation.html`,
        }
    }

    /**
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
                elements: InvocationDataModel.defineSchema().element.choices,
                cercles: super.cerclesOf('kabbale'),
                mondes: InvocationDataModel.defineSchema().monde.choices,
                sephiroth: InvocationDataModel.defineSchema().sephirah.choices
            }
        }
    }

}