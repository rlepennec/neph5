import { DocumentIdentifier } from "../../../module/documentIdentifier.js"
import { DocumentReference } from "../../../module/documentReference.js"
import { DocumentTools } from "../../../module/documentTools.js"
import { Incarnation } from "./incarnation.js";

export class Incarnations {

    /**
     * @constructor
     * @param actor The NephilimActor owner of the embedded incarnations.
     */
    constructor(actor) {
        this.actor = actor;
    }

    /**
     * @param {*} vecu The vecu world item used to create a new incarnation.
     */
    async add(event, vecu) {

        const target = DocumentTools.getDraggableTarget(event.target)?.dataset?.fsid;
        console.log(target);


        const incarnation = await Incarnation.create(this.actor, vecu);
        await new DocumentReference(incarnation[0]).addTo(this.actor);
    }

    /**
     * @param {*} incarnation The embedded item to move.
     */
    async move(event, incarnation) {

        const targetFsid = DocumentTools.getDraggableTarget(event.target)?.dataset?.fsid;
        const targetId = new DocumentIdentifier(new String(targetFsid)).id;

        const set = this.actor.system.base.incarnations;
        const arr = [...set];

        const targetIndexBegin = arr.findIndex(i => i === targetId);

        const incarnationIndex = arr.findIndex(i => i === incarnation.id);
        arr.splice(incarnationIndex, 1);

        if (targetIndexBegin === 0) {
            arr.splice(0, 0, incarnation.id);

        } else {

            const targetIndex = arr.findIndex(i => i === targetId);
            arr.splice(targetIndex+1, 0, incarnation.id);

        }

        const newSet = new Set(arr);
        const updates = {
            'system.base.incarnations': newSet
        }
        await this.actor.update(updates);

    }

    /**
     * @returns the sorted array of incarnations.
     */
    toArray() {
        let array = [];
        for (const id of this.actor.system.base.incarnations) {
            const incarnation = new Incarnation(this.actor.items.get(id));
            array.push({
                name: incarnation.name,
                fsid: incarnation.fsid
            });
        }
        return array;
    }


    insertIntoSet(set, index, value) {
        const arr = [...set];
        arr.splice(index, 0, value);
        return new Set(arr);
    }

}