import { AbstractFeature } from "../core/AbstractFeature.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";

export class Alchimie extends AbstractFeature {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     * @param item  The embedded item object, purpose of the action. 
     */
    constructor(actor, item) {
        super(actor);
        this.item = item;
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

    /**
     * @Override
     */
    async delete() {
        await this.deleteEmItem(this.sid);
        return this;
    }

}