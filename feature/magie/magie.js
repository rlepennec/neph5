import { SimpleFeature } from "../core/SimpleFeature.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";

export class Magie extends SimpleFeature {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     */
    constructor(actor) {
        super(actor);
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