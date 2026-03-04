import { Incarnation } from "../feature/incarnation/item/incarnation.js"
import { NephilimActor } from "./nephilimActor.js"
import { NephilimMixinSheet } from "./nephilimSheetMixin.js"

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

        const data = document.toObject();
        console.log(document);
        console.log(data);

        if (data.type === 'vecu') {
            const created = await Incarnation.create(this.document, data);
            const incarnation = new Incarnation(created[0]);
        }

	}

}