import { AbstractFeature } from "../core/abstractFeature.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { HistoricalFeature } from "../core/historicalFeature.js";
import { Periode } from "./periode.js";

export class Chute extends HistoricalFeature {

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
        return "Jet de Chute";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.chute';
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
    async edit() {
        await super.edit(
            "systems/neph5e/feature/periode/item/chute.html",
            {
                system: this.item.system,
                item: AbstractFeature.original(this.sid),
                periodes: this.detailsFromPeriodes(this.sid),
                degre: this.degre,
                next: this.next,
                readOnly: this.degre === null
            },
            'ITEM.TypeChute',
            560,
            500
        )
    }

    /**
     * @param actor The actor object.
     * @returns the degre and the name of chute according to the specified actor, actives periodes and current one.
     */
    static getKhaiba(actor) {
        return Chute.getChute(actor, 'khaiba');
    }

    /**
     * @param actor The actor object.
     * @returns the degre and the name of chute according to the specified actor, actives periodes and current one.
     */
    static getNarcose(actor) {
        return Chute.getChute(actor, 'narcose');
    }

    /**
     * @param actor The actor object.
     * @returns the degre and the name of chute according to the specified actor, actives periodes and current one.
     */
    static getOmbre(actor) {
        return Chute.getChute(actor, 'ombre');
    }

    /**
     * @param actor The actor object.
     * @returns the degre and the name of chute according to the specified actor, actives periodes and current one.
     */
    static getLuneNoire(actor) {
        return Chute.getChute(actor, 'luneNoire');
    }

    /**
     * @param actor The actor object.
     * @param type  The type of the chute: khaiba, narcose, ombre, luneNoire.
     * @returns the degre and the name of chute according to the specified actor, actives periodes and current one.
     */
    static getChute(actor, type) {
        let degre = 0;
        let name = null;
        for (let periode of Periode.getSorted(actor, true, true, actor.system.periode)) {
            const chute = actor.items.find(i => i.type === 'chute' && i.system.key === type && i.system.periode === periode.sid);
            if (chute != null) {
                if (name == null) {
                    name = chute.name;
                }
                degre = degre + chute.system.degre;
            }
        }
        return {
            'degre': degre,
            'name': name
        };
    }

}