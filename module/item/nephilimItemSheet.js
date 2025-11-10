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
            this.document.system.description,
            {
                secrets: this.document.isOwner,
                relativeTo: this.document
            }
        )
        //context.img = "systems/neph5e/assets/icons/voie.webp";
        return context
    }

}