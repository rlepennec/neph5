import { AbstractRoll } from "../core/abstractRoll.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";

export class Ordonnance extends AbstractRoll {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     * @param item  The embedded item object, purpose of the action. 
     */
    constructor(actor, item) {
        super(actor);
        this.item = item;
        this.periode = null;
    }

    /**
     * The system identifier of the periode to registrer.
     * @returns the instance.
     */
    withPeriode(periode) {
        this.periode = periode;
        return this;
    }

    /**
     * @Override
     */
    async drop() {
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of an ordonnance")
            .withData("periode", this.periode)
            .withoutData('description', 'monde')
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
     * @returns the number of ordonnances.
     */
    get ordonnances() {
        return this.actor.items.filter(i => i.type === 'ordonnance').length;
    }

    /**
     * @returns the monde of kabbale.
     */
    get monde() {
        return this.actor.items.find(i => i.type === 'ordonnance')?.system.monde;
    }

    /**
     * @Override
     */
    async edit() {
        await super.edit(
            "systems/neph5e/feature/kabbale/item/ordonnance.html",
            {
                item: game.items.get(this.item._id),
                system: this.item.system,
                debug: game.settings.get('neph5e', 'debug'),
                readOnly: true
            },
            'ITEM.TypeOrdonnance',
            560,
            500
        )
    }

    /**
     * @returns the data used to display the actor item.
     */
    static getAll(actor) {

        // Initialization
        let size = 0;
        let monde = null;
        let items = [];

        // For each ordonnance
        for (let item of AbstractRoll.items(actor,'ordonnance')) {
            size++;
            monde = item.original.system.monde;
            items.push({
                original: {
                    id: item.original.id,
                    name: item.original.name,
                    description: item.original.system.description
                },
                embedded: {
                    id: item.embedded.id
                }
            });
        }

        // Build product
        return {
            size: size,
            monde: monde,
            items: items
        }

    }

}