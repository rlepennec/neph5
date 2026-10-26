import { AbstractFeature } from "../../../core/abstractFeature.js";
import { SimpleFeature } from "../../../core/simpleFeature.js";
import { Incarnations } from "../../../incarnation/incarnations.js";

export class Catalyseur extends SimpleFeature {

    /**
     * Constructor.
     * @param actor The actor which performs the action. 
     */
    constructor(actor, item) {
        super(actor);
    }

    /**
     * Le catalyseur déposé est acquis à l'époque courante (voir Incarnations.acquerir) : il se
     * transmet ensuite aux incarnations suivantes, jusqu'à ce qu'une le perde.
     * @Override
     */
    async drop() {
        await new Incarnations(this.actor).acquerir(this.sid);
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
        // Les catalyseurs possédés à l'époque courante (voir Incarnations.possessions)
        let items = [];
        for (let embedded of new Incarnations(actor).possessions('catalyseur')) {
            const original = AbstractFeature.original(embedded.sid);
            if (original == null) continue;
            items.push({
                original: {
                    id: original.id,
                    sid: original.sid,
                    name: original.name,
                },
                embedded: {
                    id: embedded.id
                }
            });
        }
        return items;
    }

}