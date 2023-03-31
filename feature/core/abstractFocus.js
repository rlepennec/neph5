import { AbstractFeature } from "../core/abstractFeature.js";

export class AbstractFocus extends AbstractFeature {

    /**
     * Constructor.
     * @param actor   The actor which owns the focus.
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
     * @param periode The system identifier of the periode to registrer.
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
    async delete() {
        await this.deleteEmbeddedItem(this.sid);
    }

    /**
     * @Override
     */
    async drop() {

        // A periode must be defined
        if (this.periode == null) {
            return;
        }

        // The focus must not be defined for the current periode.
        if (this.actor.items.find(i => i.sid === this.item.sid && i.system.periode === this.embedded.periode) != null) {
            return;
        }

        // Retrieve the previous focus item if already defined.
        const previous = this.actor.items.find(i => i.sid === this.item.sid);

        // Create a new focus or move the focus to the new periode.
        await this._createEmbeddedItem(previous);

    }

    /**
     * Create a new embedded focus item or move it to the new periode.
     * @param previous The previous periode item.
     */
    async _createEmbeddedItem(previous) {
        throw new Error("AbstractFocus._createEmbeddedItem not implemented");
    }

}