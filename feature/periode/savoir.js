import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { HistoricalFeature } from "../core/historicalFeature.js";

export class Savoir extends HistoricalFeature {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     */
    constructor(actor) {
        super(actor);
    }

    /**
     * @Override
     */
    withItem(item) {
        super.withItem(item);
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
    get title() {
        return "Jet de Savoir ésotérique";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.savoir';
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