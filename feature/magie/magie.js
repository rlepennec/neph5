import { AbstractFeature } from "../core/AbstractFeature.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";

export class Magie extends AbstractFeature {

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
            .withContext("Drop of a voie magique")
            .withoutData('description')
            .withDeleteAfter(this.actor.items.filter(i => i.type === 'magie'))
            .create();
    }

    /**
     * @Override
     */
    async delete() {
        await this.deleteEmbeddedItem(this.sid);
        return this;
    }

}