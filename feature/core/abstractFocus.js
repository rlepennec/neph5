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
    async drop() {

        // A periode must be defined
        if (this.periode == null) {
            return;
        }

        // The focus must not be defined for the current periode.
        if (this.actor.items.find(i => i.sid === this.sid && i.system.periode === this.periode) != null) {
            return;
        }

        // Retrieve the previous periode for which the focus is defined.
        const previous = this.actor.items.find(i => i.sid === this.sid);

        // Create a new focus or move the focus to the new periode.
        await this._drop(previous);

    }

    /**
     * Create a new focus or move the focus to the new periode.
     * @param previous The preivous periode item.
     */
    async _drop(previous) {
        throw new Error("AbstractFocus._drop not implemented");
    }

}