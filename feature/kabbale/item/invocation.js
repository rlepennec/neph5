import { InvocationDataModel } from "./invocation.mjs";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class InvocationSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 1220,
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
        this.applySkin(this.document.system.element);
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