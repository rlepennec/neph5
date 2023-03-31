import { AbstractFeature } from "../core/abstractFeature.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { HistoricalFeature } from "../core/historicalFeature.js";

export class Passe extends HistoricalFeature {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     */
    constructor(actor) {
        super(actor);
        this.attachPeriode = true;
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
        return "Jet de Passé";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.passe';
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
     * Set no periode is attached to the passe.
     * @returns the instance.
     */
    withoutPeriode() {
        this.attachPeriode = false;
        return this;
    }

    /**
     * @Override
     */
    async drop() {
        if (this.attachPeriode === true) {
            if (this.periode != null &&
                this.actor.items.find(i => i.sid === this.sid && i.system.periode === this.periode) == null) {
                await new EmbeddedItem(this.actor, this.sid)
                    .withContext("Drop of a passe on periode " + this.periode)
                    .withData("degre", 0)
                    .withData("periode", this.periode)
                    .withoutData('description')
                    .withoutAlreadyEmbeddedError()
                    .create();
            }
        } else {
            if (this.actor.items.find(i => i.sid === this.sid) == null) {
                await new EmbeddedItem(this.actor, this.sid)
                    .withContext("Drop of a passe")
                    .withData("degre", 0)
                    .withoutData('description')
                    .withoutAlreadyEmbeddedError()
                    .create();
            } 
        }
    }

    /**
     * @Override
     */
    async edit() {
        await super.edit(
            "systems/neph5e/feature/periode/item/passe.html",
            {
                system: this.item.system,
                item: AbstractFeature.original(this.sid),
                periodes: this.detailsFromPeriodes(this.sid),
                degre: this.degre,
                next: this.next,
                readOnly: this.degre === null
            },
            'ITEM.TypePasse',
            560,
            500
        )
    }

}