import { NephilimDocumentSheet } from "../document/nephilimDocumentSheet.js"

export class NephilimActorSheet extends NephilimDocumentSheet  {

    static DEFAULT_OPTIONS = {
        classes: ["actor"]
    }

    /** 
     * @override
     */
	async drop(document) {
        console.log(document);

        const data = document.toObject();
        console.log(data);

        let item = (await this.document.createEmbeddedDocuments("Item", [data]))[0];

	}

}