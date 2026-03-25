import { DocumentReference } from "../../../module/documentReference.js"
import { Incarnation } from "./incarnation.js";

export class Incarnations {

    /**
     * @constructor
     * @param actor The NephilimActor.
     */
    constructor(actor) {
        this.actor = actor;
    }

    /**
     * @param {*} vecu The vecu world item used to create a new incarnation.
     */
    async add(vecu) {
        const incarnation = await Incarnation.create(this.actor, vecu);
        await new DocumentReference(incarnation[0]).addTo(this.actor);
    }

    async move(incarnation) {

        const set = this.actor.system.base.incarnations;
        const reversedSet = new Set([...set].reverse());
        const updates = {
            'system.base.incarnations': reversedSet
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

/*
function insertIntoSet(set, index, value) {
  const arr = [...set];
  arr.splice(index, 0, value);
  return new Set(arr);
}
  */



}