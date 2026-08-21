import { CompetenceDataModel } from "./competence.mjs";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class CompetenceSheet extends NephilimItemSheet {

    /**
     * La compétence n'est pas éditable lorsqu'elle est ouverte depuis un acteur.
     * @override
     */
    get editableFromActor() {
        return false;
    }

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
        this.applySkin(this.document.system.element);
    }

}