import { InvocationDataModel } from "./invocation.mjs";
import { NephilimItemSheet } from "../../../module/item/base.js";

export class InvocationSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 500
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
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                elements: InvocationDataModel.defineSchema().element.choices,
                cercles: super.cerclesOf2('kabbale'),
                mondes: InvocationDataModel.defineSchema().monde.choices,
                sephiroth: InvocationDataModel.defineSchema().sephirah.choices
            }
        }
    }

}