import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";
import { NephilimChat } from "../../../module/common/chat.js";

/**
 * If no ammunition fired
 *   => Not allowed
 * Else
 *   => Reset current visee
 *   => Set ammunition to maximum
 */
export class Recharger extends AbstractManoeuver {

    static ID = "recharger";

    /**
     * Constructor.
     */
    constructor() {
        super(Recharger.ID, Constants.TACTIC);
        this.withNoTarget();
        this.withImpact({fix: 0});
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return action.weapon.system.tire > 0;
    }

    /**
     * @Override
     */
    async apply(action) {

        // Forbidden
        if (this.canBePerformed(action) === false) {
            return;
        }

        await action.weapon.update({ ['system.tire']: 0 });

        await new NephilimChat(action.actor)
            .withTemplate("systems/neph5e/feature/core/chat.hbs")
            .withData({
                actor: action.actor,
                sentence: game.i18n.localize('NEPH5E.manoeuvres.recharger.sentence').replaceAll("${arme}", action.weapon.name),
                richSentence: game.i18n.localize('NEPH5E.manoeuvres.recharger.sentence').replaceAll("${arme}", action.weapon.name),
                img: action.img,
                reload: action.weapon.system.munitions
            })
            .withFlags({})
            .create();

        return this;
    }

}