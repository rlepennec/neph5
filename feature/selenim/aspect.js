import { AbstractFeature } from "../core/abstractFeature.js";
import { SimpleFeature } from "../core/simpleFeature.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";

export class Aspect extends SimpleFeature {

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
            .withContext("Drop of an aspect")
            .withData("active", false)
            .withoutData('description', 'degre', 'activation', 'duree')
            .create();
    }

    /**
     * @Override
     */
    async delete() {
        await this.deleteEmbeddedItem(this.sid);
        return this;
    }

    /**
     * @Override
     */
     async edit() {
        await super.edit(
            "systems/neph5e/feature/selenim/item/aspect.html",
            {
                item: game.items.get(this.item._id),
                system: this.item.system,
                debug: game.settings.get('neph5e', 'debug'),
                difficulty: 0
            },
            'ITEM.TypeAspect',
            600,
            500
        )
    }

    /**
     * @returns the data used to display the actor item.
     */
    static getAll(actor) {

        // Initialization
        let size = 0;
        let  aspects = [];

        // For each aspects
        for (let item of AbstractFeature.items(actor,'aspect')) {

            // Update the number of points of the imago.
            size = size + parseInt(item.original.system.degre);

            // Add the aspect
            aspects.push({
                original: {
                    id: item.original.id,
                    sid: item.original.sid,
                    name: item.original.name
                },
                embedded: {
                    id: item.embedded.id,
                    active: item.embedded.system.active
                }
            });

        }

        // Build product
        return {
            size: size,
            aspects: aspects
        }

    }

    /**
     * Set the activate status of the aspect of imago.
     * @returns the instance.
     */
    async toggleActive() {
        const embedded = AbstractFeature.embedded(this.actor, this.sid);
        const system = duplicate(embedded.system);
        system.active = !system.active;
        await embedded.update({ ['system']: system });
        return this;
    }

}