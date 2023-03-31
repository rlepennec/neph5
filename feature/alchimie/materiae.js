import { AbstractFeature } from "../core/abstractFeature.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Game } from "../../module/common/game.js";
import { SimpleFeature } from "../core/simpleFeature.js";

export class Materiae extends SimpleFeature {

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
            .withContext("Drop of a materiae")
            .withData("quantite", 0)
            .withoutData('description', 'element')
            .create();
    }

    /**
     * @Override
     */
    async edit() {
        await super.edit(
            "systems/neph5e/feature/alchimie/item/materiae.html",
            {
                item: game.items.get(this.item._id),
                system: this.item.system,
                elements: Game.pentacle.elements,
                debug: game.settings.get('neph5e', 'debug'),
                readOnly: true
            },
            'ITEM.TypeMateriae',
            560,
            500
        )
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
                    name: item.original.name,
                    element: item.original.system.element
                },
                embedded: {
                    id: item.embedded.id,
                    quantite: item.embedded.system.quantite
                }
            });
        }
        return items;

    }

}