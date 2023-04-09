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

        let _chute = { degre: 0, name: null, sid: null };

        for (let periode of Periode.getChronological(actor, true, true, actor.system.periode)) {
            const chute = actor.items.find(i => i.type === 'chute' && i.system.key === type && i.system.periode === periode.sid);
            if (chute != null) {
                _chute = {
                    degre: _chute.degre + chute.system.degre,
                    name: chute.name,
                    sid: chute.sid
                }
            }
        }

        return _chute;

    }

    /**
     * Set the final degre of the specified chute. The degre of the current periode is computed according
     * to the degres of the previous periodes.
     * @param type  The type of chute to update: khaiba, narcose, ombre, luneNoire.
     * @param degre The final degre to set.
     */
    async setDegre(type, degre) {

        // Retrieve the previous chute according to the current periode
        const previousChute = Chute.getChute(this.actor, type);

        // Create or update current chute according to the current periode, first chute by default
        const chute = this.actor.items.find(i => i.type === "chute" && i.system.key === type && i.system.periode === this.actor.system.periode);

        // Create a new chute
        if (chute == null) {

            // Retrieve the sid of the world chute item from which to create the new chute
            const sid = previousChute.sid ?? game.items.find(i => i.type === 'chute' && i.system.key === type)?.sid;
            if (sid == null) {
                ui.notifications.warn(game.i18n.localize("NEPH5E.warning.chutes"));
                return;
            }

            // Create the new embedded actor item
            await new EmbeddedItem(this.actor, sid)
                .withData("periode", this.actor.system.periode)
                .withData("degre", degre === previousChute.degre == 1 ? -degre : degre - previousChute.degre)
                .withData("key", type)
                .withoutData('description')
                .withoutAlreadyEmbeddedError()
                .create();

        // Update the current chute
        } else {
            await chute.update({ ['system.degre']: chute.system.degre - previousChute.degre + (degre === previousChute.degre ? 0 : degre) }); 
        }

    }


}