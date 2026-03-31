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
     * Add a new incarnation to the actor.
     * @param {*} event The drop event which contains the incarnation on which the incarnation has been dropped.
     * @param {*} vecu  The vecu world item used to create a new incarnation.
     */
    async add(event, vecu) {

        // Create the new embedded document
        const incarnation = (await Incarnation.create(this.actor, vecu))[0];

        // Update the actor document
        await new DocumentReference(incarnation).addTo(this.actor);

        // Move the new incarnation if necessary
        if (this.actor.system.base.incarnations.size > 1) {
            await this.move(event, incarnation);
        }
    }

    /**
     * Delete the specified incarnation.
     * @param {*} incarnation The incarnation to delete.
     */
    async delete(incarnation) {

        // Update the actor document first because embedded documents are needed
        // to update the list of the incarnations.
        await new DocumentReference(incarnation).removeFrom(this.actor);

        // Delete the embedded document
        await this.actor.deleteEmbeddedDocuments('Item', [incarnation.id]);

    }

    /**
     * Move the specified incarnation to the specified target.
     * @param {*} event       The drop event which contains the incarnation on which the incarnation has been dropped.
     * @param {*} incarnation The embedded item to move.
     */
    async move(event, incarnation) {

        // The fsid of the target can be null if the drop has been done on the free space which not contains
        // any incarnation. In this case, the incarnation is pushed at the end of the set.
        const fsid = DocumentTools.getDraggableTarget(event.target)?.dataset?.fsid;

        // The identifier of the incarnation target
        const id = fsid == null ? null : new DocumentIdentifier(fsid).id;
        const array = [...this.actor.system.base.incarnations];

        // Move the incarnation at the top of the list if the target is the first element of the list
        const first = fsid == null ? false : array.findIndex(i => i === id) === 0;

        // Remove the incarnation to move from the list
        array.splice(array.findIndex(i => i === incarnation.id), 1);

        // Insert the incarnation at the top of the list if first, at the end if fsid is null, in the list otherwise
        array.splice(first ? 0 : fsid == null ? array.length : array.findIndex(i => i === id) + 1, 0, incarnation.id);

        // Update the actor document
        await this.actor.update({
            'system.base.incarnations': new Set(array)
        });

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
                fsid: incarnation.fsid,
                competences: incarnation.competences
            });
        }
        return array;
    }



}