import { NephilimActor } from "./nephilimActor.js"
import { NephilimMixinSheet } from "./document/nephilimSheetMixin.js"

export class NephilimActorSheet extends NephilimMixinSheet(foundry.applications.api.DocumentSheetV2) {

    static get documentClass() {
        return NephilimActor;
    }

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