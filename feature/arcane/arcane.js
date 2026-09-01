import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { HistoricalFeature } from "../core/historicalFeature.js";

export class Arcane extends HistoricalFeature {

    /**
     * @Override
     */
    get title() {
        return "Jet d'Arcane";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPHILIM.tenteSelfArcane';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withItem(this.item)
            .withBase(this.item.name, this.degre)
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

    /**
     * Get the arcanes according to the specified character and the active periodes.
     * @param actor The actor object.
     * @returns the arcanes to display in the character sheet.
     */
    static getAll(actor) {
        const all = [];
        for (let s of game.items.filter(i => i.type === 'arcane')) {
            const feature = new Arcane(actor).withItem(s);
            all.push({
                name: feature.name,
                sid: feature.sid,
                id: s.id,
                degre: feature.degre
            });
        }
        return all;
    }

}