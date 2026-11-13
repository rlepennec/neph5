import { ActionDataBuilder } from "../../../core/regles/v5/actionDataBuilder.js";
import { IncarnationsV5 } from "../../../incarnation/regles/v5/incarnations.js";
import { Constants } from "../../../../module/common/regles/v5/constants.js";
import { EmbeddedItem } from "../../../core/regles/v5/embeddedItem.js";
import { HistoricalFeature } from "../../../core/regles/v5/historicalFeature.js";

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
                if (this.periode != null && !new IncarnationsV5(this.actor).aRattache(this.sid, this.periode)) {
                    await new EmbeddedItem(this.actor, this.sid)
                        .withContext("Drop of the item " + this.sid + " on periode " + this.periode)
                        .withIncarnation(this.periode, 0)
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