import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Version } from "../../../module/common/version.js";
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
    constructor(action) {
        super(Recharger.ID, Constants.TACTIC, action);
        this.target = false;
        this.impact = {fix: 0};
    }

    /**
     * @Override
     */
    isAllowed(action) {
        return Version.data(action.weapon).tire > 0;
    }

    /**
     * @Override
     */
    async apply(action) {

        // Forbidden
        if (this.canBePerformed(action) === false) {
            return;
        }

        await action.weapon.update({ [Version.path(action.weapon, 'tire')]: 0 });

        await new NephilimChat(action.actor)
            .withTemplate("systems/neph5e/feature/core/chat.hbs")
            .withData({
                actor: action.actor,
                sentence: game.i18n.localize('NEPHILIM.manoeuvreRechargerSentence').replaceAll("${arme}", action.weapon.name),
                richSentence: game.i18n.localize('NEPHILIM.manoeuvreRechargerSentence').replaceAll("${arme}", action.weapon.name),
                img: action.img,
                reload: Version.data(action.weapon).munitions
            })
            .withFlags({})
            .create();

        return this;
    }

}