import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { HistoricalFeature } from "../core/historicalFeature.js"; 

export class Savoir extends HistoricalFeature {

    /**
     * @Override
     */
    get title() {
        return "Jet de Savoir ésotérique";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPHILIM.tenteSelfSavoir';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withItem(this.item)
            .withBase(this.item.name, this.degre)
            .withFraternite(this.fraternite)
            .withBlessures(Constants.MAGICAL)
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

}