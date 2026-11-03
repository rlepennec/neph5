import { AbstractFeature } from "../../../core/regles/v5/abstractFeature.js";
import { SimpleFeature } from "../../../core/regles/v5/simpleFeature.js";
import { IncarnationsV5 } from "../../../incarnation/regles/v5/incarnations.js";

export class Catalyseur extends SimpleFeature {

    /**
     * Constructor.
     * @param actor The actor which performs the action. 
     */
    constructor(actor, item) {
        super(actor);
    }

    /**
     * Le catalyseur déposé est acquis à l'époque courante (voir IncarnationsV5.acquerir) : il se
     * transmet ensuite aux incarnations suivantes, jusqu'à ce qu'une le perde.
     * @Override
     */
    async drop() {
        await new IncarnationsV5(this.actor).acquerir(this.sid);
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
        // Les catalyseurs possédés à l'époque courante (voir IncarnationsV5.possessions)
        let items = [];
        for (let embedded of new IncarnationsV5(actor).possessions('catalyseur')) {
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