import { AbstractFeature } from "../core/abstractFeature.js";
import { SimpleFeature } from "../core/simpleFeature.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";

export class Catalyseur extends SimpleFeature {

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
        const item = await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a catalyseur")
            .withoutData('description')
            .create();
    }

    /**
     * @Override
     */
    getEmbeddedData() {
        return {
            readOnly: true
        }
    }

    /**
     * @returns the data used to display the actor item.
     */
    static getAll(actor) {
        let items = [];
        for (let item of AbstractFeature.items(actor,'catalyseur')) {
            items.push({
                original: {
                    id: item.original.id,
                    name: item.original.name,
                },
                embedded: {
                    id: item.embedded.id
                }
            });
        }
        return items;
    }

}