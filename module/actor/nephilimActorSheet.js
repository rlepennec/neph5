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
     * @override
     */
	async drop(document) {
        console.log(document);
	}

}