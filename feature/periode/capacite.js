import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { HistoricalFeature } from "../core/historicalFeature.js";

export class Capacite extends HistoricalFeature {

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
    withPeriode(periode) {
        super.withPeriode(periode);
        return this;
    }

    /**
     * @Override
     */
    getEmbeddedData() {
        return {
            periodes: this.detailsFromPeriodes(this.sid),
            readOnly: true
        }
    }

    /**
     * @Override
     */
    async drop() {

        if (this.actor.type !== "figure") {
            return;
        }

        // A periode must be defined
        if (this.periode == null) {
            return;
        }

        // The capacite must not be defined for the current periode.
        if (this.actor.items.find(i => i.sid === this.item.sid && i.system.periode === this.embedded.periode) != null) {
            return;
        }

        // Create a new capacite or move the capacite to the new periode.
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a capacite")
            .withDeleteExisting()
            .withData("periode", this.periode)
            .withoutData('description')
            .create();


    }

}