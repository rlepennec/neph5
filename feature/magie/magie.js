import { SimpleFeature } from "../core/simpleFeature.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";

export class Magie extends SimpleFeature {

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

}