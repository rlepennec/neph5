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

        const data = document.toObject();
        console.log(data);

        let item = (await this.document.createEmbeddedDocuments("Item", [data]))[0];
        console.log(item);
	}

}