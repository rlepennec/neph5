import { DocumentReference } from "./document/documentReference.js"
import { NephilimItem } from "./nephilimItem.js"
import { NephilimMixinSheet } from "./document/nephilimSheetMixin.js"

export class NephilimItemSheet extends NephilimMixinSheet(foundry.applications.api.DocumentSheetV2) {

    static get documentClass() {
        return NephilimItem;
    }

    static DEFAULT_OPTIONS = {
        classes: ["item"]
    }

    /** 
     * @override
     */
	async drop(document) {
        await new DocumentReference(this.document).removeFromRegister(document);
        await new DocumentReference(document).addTo(this.document);
        await new DocumentReference(this.document).addTo(document);
	}

}