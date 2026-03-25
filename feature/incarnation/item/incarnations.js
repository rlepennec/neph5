import { DocumentReference } from "../../../module/documentReference.js"
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
    async add(vecu) {
        const incarnation = await Incarnation.create(this.actor, vecu);
        await new DocumentReference(incarnation[0]).addTo(this.actor);
    }

    /**
     * @param {*} incarnation The embedded item to move.
     */
    async move(event, incarnation) {


        const tg = this._getDraggableTarget(event.target);
        //tg = null ? last
        console.log("Target");
        console.log(tg);
        console.log(tg?.dataset);



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

		/**
		 * @param target The event part which describes the html target.
		 * @returns the draggable element.
		 */
		_getDraggableTarget(target) {
			if (target == null) return null;
			if (target.classList.contains("draggable")) {
				return target;
			} else {
				return this._getDraggableTarget(target.parentElement);
			}
		}

}