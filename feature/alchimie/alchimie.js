import { SimpleFeature } from "../core/simpleFeature.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";

export class Alchimie extends SimpleFeature {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     */
    constructor(actor, item) {
        super(actor);
    }

    /**
     * @Override
     */
    async drop() {
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a voie alchimique")
            .withoutData('description')
            .withDeleteAfter(this.actor.items.filter(i => i.type === 'alchimie'))
            .create();
    }

}