import { AbstractFeature } from "./AbstractFeature.js";

export class SimpleFeature extends AbstractFeature {

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
        this.embedded = this.actor.items.find(i => i.sid === item.sid);
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
     * @Override
     */
    async delete() {
        await this.deleteEmbeddedItem(this.sid);
        return this;
    }

}