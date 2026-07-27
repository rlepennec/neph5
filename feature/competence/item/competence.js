import { CompetenceDataModel } from "./competence.mjs";
import { Constants } from "../../../module/common/constants.js";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { Game } from "../../../module/common/game.js";

export class CompetenceSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 800,
            height: 470
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/competence/item/competence.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                elements: CompetenceDataModel.defineSchema().element.choices,
            }
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

        // Pas de skin en style classique.
        const style = game.settings.get('neph5e', 'styleItemSheet');
        if (style === 'classique') return;

        const element = this.document.system.element;
        if (element) this.element.classList.add(`skin-${element}`);
    }

}