import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { HistoricalFeature } from "../core/historicalFeature.js";

export class Passe extends HistoricalFeature {

    /**
     * @Override
     */
    get title() {
        return "Jet de Passé";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPHILIM.tenteSelfPasse';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withItem(this.item)
            .withBase(this.item.name, this.degre)
            .withFraternite(this.fraternite)
            .withBlessures(Constants.PHYSICAL)
            .export();
    }

    /**
     * @Override
     */
    getEmbeddedData() {
        return {
            periodes: this.detailsFromPeriodes(this.sid),
            degre: this.degre,
            next: this.next,
            readOnly: this.degre === null
        }
    }

    /**
     * @Override
     */
    get degre() {
        switch (this.actor.type) {
            case 'figure':
                return this.degreFromPeriodes(this.sid);
            case 'figurant':
                return 1;
        }
    }

    /**
     * @Override
     */
    async drop() {
        switch (this.actor.type) {
            case 'figure':
                if (this.periode != null && this.actor.items.find(i => i.sid === this.sid && i.system.periode === this.periode) == null) {
                    await new EmbeddedItem(this.actor, this.sid)
                        .withContext("Drop of the item " + this.sid + " on periode " + this.periode)
                        .withData("degre", 0)
                        .withData("periode", this.periode)
                        .withoutData('description')
                        .withoutAlreadyEmbeddedError()
                        .create();
                }
                break;
            case 'figurant':
                if (this.actor.items.find(i => i.sid === this.sid) == null) {
                    await new EmbeddedItem(this.actor, this.sid)
                        .withContext("Drop of the item " + this.sid)
                        .withData("degre", 0)
                        .withoutData('description')
                        .withoutAlreadyEmbeddedError()
                        .create();
                }
                break;
        }


    }

}