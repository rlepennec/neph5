import { DocumentIdentifier } from "./documentIdentifier.js"
import { DocumentReference } from "./documentReference.js"
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
    async _onDrop(event) {
        if (this.locked) return;

        const target = this._getDraggableTarget(event.target);
        console.log("Target");
        console.log(target?.dataset);

        const document = new DocumentIdentifier(event).toDocument();
        if (document == null) {
            ui.notifications.warn("Can't drop this kind of object");
            return;
        }

        const data = document.toObject();
        console.log(document);
        console.log(data);

        if (data.type === 'vecu') {
            const created = await Incarnation.create(this.document, data);
            const incarnation = new Incarnation(created[0]);

            await new DocumentReference(created[0]).addTo(this.document);


        }

	}




}