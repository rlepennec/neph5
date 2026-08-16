import { Constants } from "../../../module/common/constants.js";
import { Game } from "../../../module/common/game.js";
import { MateriaeDataModel } from "./materiae.mjs";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class MateriaeSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 700,
            height: 640
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/alchimie/item/materiae.html`,
        }
    }

    /**
     * @override
     */
    async _onRender(context, options) {
        await super._onRender(context, options);
        const style = game.settings.get('neph5e', 'styleItemSheet');
        if (style === 'classique') return;
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
                elements: MateriaeDataModel.defineSchema().element.choices,
            }
        }
    }

}