import { AbstractFeature } from "../core/AbstractFeature.js";

export class AbstractFocus extends AbstractFeature {

    /**
     * Constructor.
     * @param actor   The actor which owns the focus.
     * @param item    The embedded focus item object.
     * @param periode The system identifier of the periode to register.
     */
    constructor(actor, item, periode) {
        super(actor);
        this.item = item;
        this.original = item == null ? null : game.items.find(i => i.sid === item.sid);
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
    async delete() {
        await this.deleteEmbeddedItem(this.sid);
    }

    /**
     * @param item The original focus item object.
     */
    async dropOriginal(item) {

        // A periode must be defined
        if (this.periode == null) {
            return;
        }

        // The focus must not be defined for the current periode.
        if (this.actor.items.find(i => i.sid === item.sid && i.system.periode === item.periode) != null) {
            return;
        }

        // Retrieve the previous focus item if already defined.
        const previous = this.actor.items.find(i => i.sid === item.sid);

        // Create a new focus or move the focus to the new periode.
        await this._drop(item, previous);

    }

    /**
     * Create a new focus or move the focus to the new periode.
     * @param item     The original focus item object.
     * @param previous The preivous periode item.
     */
    async _drop(item, previous) {
        throw new Error("AbstractFocus._drop not implemented");
    }

}