import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { DocumentReference } from "../../../module/document/documentReference.js";

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
            sheet: {
                vecus: new DocumentReference('Item', 'vecu').getReferencesOf(this.document)
            }
        };
        return context;
    }

}