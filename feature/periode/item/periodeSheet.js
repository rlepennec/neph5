import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { DocumentReferences } from "../../../module/document/documentReferences.js";

export class PeriodeSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        id: "periode",
        classes: ["periode"],
        position: {
            height: 500,
            width: 590,
        },
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/periode/item/periodeSheet.html`,
        }
    }

    async _prepareContext(options) {
        const context = {
            ...await super._prepareContext(options),
            context: {
                vecus: new DocumentReferences('Item', 'vecu', this.document)
            }
        };
        return context;
    }

}