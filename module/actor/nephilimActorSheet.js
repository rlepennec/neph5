import { DocumentIdentifier } from "../document/documentIdentifier.js"
import { NephilimDocumentSheet } from "../document/nephilimDocumentSheet.js"

export class NephilimActorSheet extends NephilimDocumentSheet  {

    static DEFAULT_OPTIONS = {
        classes: ["actor"],
        form: {
            closeOnSubmit: false,
            submitOnChange: true,
        },
        editable: true,
        tag: "form",
        window: {
            resizable: true,
        },
    }

    /**
     * @Override 
     */
    async _onDrop(event) {
        if (this.locked) return;
        const drop = new DocumentIdentifier(event).toDocument();
        if (drop == null) {
            ui.notifications.warn("Can't drop this kind of object");
            return;
        }

        console.log(drop);


    }
}