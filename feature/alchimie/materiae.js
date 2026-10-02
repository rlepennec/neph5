import { AbstractFeature } from "../core/abstractFeature.js";
import { Version } from "../../module/common/version.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { SimpleFeature } from "../core/simpleFeature.js";

export class Materiae extends SimpleFeature {

    /**
     * @Override
     */
    async drop() {
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a materiae")
            .withData("quantite", 0)
            .withoutData('description', 'element')
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
        for (let item of AbstractFeature.items(actor,'materiae')) {
            items.push({
                original: {
                    id: item.original.id,
                    sid: item.original.sid,
                    name: item.original.name,
                    element: Version.data(item.original).element
                },
                embedded: {
                    id: item.embedded.id,
                    quantite: Version.data(item.embedded).quantite
                }
            });
        }
        return items;

    }

}