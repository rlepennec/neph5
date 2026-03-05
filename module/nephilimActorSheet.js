import { DocumentIdentifier } from "./documentIdentifier.js"
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
        console.log(event);
        console.log(event.target);
        console.log(event.target.dataset);

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
        }

	}

    /**
     * @param target The event part which describes the html target.
     * @returns the identifier of the embedded periode.
     */
    getParentPeriode(target) {
        if (target == null) return null;
        if (target.getAttribute?.("draggable") === "true") {
            return target.dataset.sid;
        } else {
            return this.getParentPeriode(target.parentElement);
        }
    }


}