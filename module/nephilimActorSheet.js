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
    async _onDrops(event) {
        throw new Error("_onMove method must be implemented");
    }

    /** 
     * @override
     */
    async _onDrop(event, document) {

        // A move 
        if (document.actor === this.document) {

            switch(document.type) {
                case 'incarnation': {
                    const set = this.document.system.base.incarnations;
                    const reversedSet = new Set([...set].reverse());
                    const updates = {
                        'system.base.incarnations': reversedSet
                    }
                    await this.document.update(updates);
                    break;
                }
            }

        } else {

            switch(document.type) {
                case 'vecu': {
                    const incarnation = await Incarnation.create(this.document, document);
                    await new DocumentReference(incarnation[0]).addTo(this.document);
                    break;
                }
            }

        }

    }

}