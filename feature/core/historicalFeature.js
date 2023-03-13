import { AbstractFeature } from "./AbstractFeature.js";
import { FeatureBuilder } from "./featureBuilder.js";

export class HistoricalFeature extends AbstractFeature {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     */
    constructor(actor) {
        super(actor);
    }

    /**
     * @param item The original or embedded item object, purpose of the action.
     * @returns the instance.
     */
    withItem(item) {
        if (item.actor == null) {
            return this.withOriginalItem(item);
        } else {
            return this.withEmbeddedItem(item);
        }
    }

    /**
     * @param item The original item object, purpose of the action.
     * @returns the instance.
     */
    withOriginalItem(item) {
        this.item = item;
        return this;
    }

    /**
     * @param item The embedded item object, purpose of the action.
     * @returns the instance.
     */
    withEmbeddedItem(item) {
        this.embedded = item;
        this.item = game.items.find(i => i.sid === item.sid);
        return this;
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
    get purpose() {
        return this.item;
    }

    /**
     * @Override
     */
    get degre() {
        return this.degreFromPeriodes(this.sid);
    }

    /**
     * @param type The type of item.
     * @returns all features to display in the actor sheet according to the active periodes.
     */
    getAll(type) {
        const features = [];
        for (let item of game.items.filter(i => i.type === type)) {
            const feature = new FeatureBuilder(this.actor).withOriginalItem(item.sid).create();
            if (feature.degre !== 0) {
                features.push({
                    name: feature.name,
                    sid: feature.sid,
                    id: item.id,
                    degre: feature.degre
                });
            }
        }
        return features;
    }

}