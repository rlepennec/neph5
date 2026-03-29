import { DocumentIdentifier } from "./documentIdentifier.js"
import { DocumentReference } from "./documentReference.js"
import { NephilimItem } from "./nephilimItem.js"
import { NephilimMixinSheet } from "./nephilimSheetMixin.js"

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
    async _onDrop(event) {
        if (this.locked) return;
        const document = new DocumentIdentifier(event).toDocument();
        if (document == null) {
            ui.notifications.warn("Can't drop this kind of object");
            return;
        }
        await new DocumentReference(this.document).removeFromRegister(document);
        await new DocumentReference(document).addTo(this.document);
        await new DocumentReference(this.document).addTo(document);
	}

    /** 
     * @override
     */
    async _onDelete(event, target) {
        const remove = new DocumentIdentifier(target).toDocument();
        await new DocumentReference(remove).removeFrom(this.document);
        await new DocumentReference(this.document).removeFrom(remove);
    }

}