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


// from drag data
// {type: 'incarnation', id: 'MDMjx0rA7itmqKf2'} move actor item
// {type: 'Item', uuid: 'Item.7wt1LWEnpnDBHRk0'} from world item
const data2 = JSON.parse(event.dataTransfer.getData("text/plain"));
console.log("data2");
console.log(data2);
        
if (data2.type === 'incarnation') {
    const set = this.document.system.base.incarnations;
    const reversedSet = new Set([...set].reverse());
    const updates = {
        'system.base.incarnations': reversedSet
    }
    await this.document.update(updates);
    return;
}


// DOMStringMap {drag: 'true', itemId: 'bPyM6ueNBx7dqM5w'}
// Undefined - from world item
        const target = this._getDraggableTarget(event.target);
        console.log("Target");
        console.log(target?.dataset);

        const document = new DocumentIdentifier(event).toDocument();

// document != null if from world item

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