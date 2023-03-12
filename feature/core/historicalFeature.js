import { AbstractFeature } from "./AbstractFeature.js";

export class HistoricalFeature extends AbstractFeature {

    /**
     * Constructor.
     * @param actor   The actor which performs the action.
     * @param item    The original item object. 
     * @param periode The optional system identifier of the periode.
     */
    constructor(actor, item, periode) {
        super(actor);
        this.item = item;
        this.embedded = actor.items.find(i => i.sid === item.sid);
        this.periode = periode;
    }

    /**
     * @Override
     */
    get purpose() {
        return this.item;
    }

    /**
     * @Override
     */
    get degre() {
        return this.degreFromPeriodes(this.sid);
    }

}