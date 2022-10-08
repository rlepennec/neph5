import { AbstractRoll } from "../core/abstractRoll.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";

export class Catalyseur extends AbstractRoll {

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
        const item = await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a catalyseur")
            .withoutData('description')
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
            "systems/neph5e/feature/alchimie/item/catalyseur.html",
            {
                item: game.items.get(this.item._id),
                system: this.item.system,
                debug: game.settings.get('neph5e', 'debug'),
                readOnly: true
            },
            'ITEM.TypeCatalyseur',
            560,
            500
        )
    }

    /**
     * @returns the data used to display the actor item.
     */
    static getAll(actor) {
        let items = [];
        for (let item of AbstractRoll.items(actor,'catalyseur')) {
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