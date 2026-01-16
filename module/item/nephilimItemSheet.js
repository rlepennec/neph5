import { DocumentReference } from "../document/documentReference.js"
import { NephilimDocumentSheet } from "../document/nephilimDocumentSheet.js"

export class NephilimItemSheet extends NephilimDocumentSheet  {

    static DEFAULT_OPTIONS = {
        classes: ["item"],
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
     * @constructor
     * @param  {...any} args
     */
    constructor(...args) {
        super(...args);
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        const context = await super._prepareContext(options)
        context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
            this.document.system.item.base.description,
            {
                secrets: this.document.isOwner,
                relativeTo: this.document
            }
        )
        context.locked = this.locked;
        //context.img = "systems/neph5e/assets/icons/voie.webp";
        return context
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