import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Version } from "../../../module/common/version.js";
import { Constants } from "../../../module/common/constants.js";
import { NephilimChat } from "../../../module/common/chat.js";

/**
 * If the actor has no token
 *   => Not allowed
 * If the actor has no target
 *   => Not allowed
 * If the actor has a new target
 *   => New target with visee = 1
 * Else
 *   If the visee < 3
 *     => Target with visee + 1
 *   Else
 *     => Not allowed
 */
export class Viser extends AbstractManoeuver {

    static ID = "viser";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Viser.ID, Constants.TACTIC, action);
        this.impact = {fix: 0};
        this.clearViser = false;
    }

    /**
     * @param action The action for which to process the visee.
     * @returns the current modifier.
     */
    modifier(action) {

        // On the current target
        if (Version.data(action.weapon).cible === action.target?.id) {
            switch (Version.data(action.weapon).type) {
                case Constants.FEU:
                    return Version.data(action.weapon).visee === null ? -40 : Version.data(action.weapon).visee * 20;
                case Constants.TRAIT:
                    return Version.data(action.weapon).visee * 20;
            }

        // An other target
        } else {
            switch (Version.data(action.weapon).type) {
                case Constants.FEU:
                    return -40;
                case Constants.TRAIT:
                    return 0;
            }
        }

    }

    /**
     * @Override
     */
    isAllowed(action) {
        return action.actor != null &&
               action.target != null &&
              (Version.data(action.weapon).type !== Constants.FEU || Version.data(action.weapon).munitions - Version.data(action.weapon).tire > 0) &&
              (Version.data(action.weapon).cible !== action.target.id || Version.data(action.weapon).visee < 3);

    }

    /**
     * @Override
     */
    async apply(action) {

        // Forbidden
        if (this.canBePerformed(action) === false) {
            return;
        }

        // New target or one round more on same target
        if (Version.data(action.weapon).cible !== action.target.id) {
            await action.weapon.update({ [Version.path(action.weapon, 'cible')]: action.target.id });
            await action.weapon.update({ [Version.path(action.weapon, 'visee')]: 1 });
        } else {
            await action.weapon.update({ [Version.path(action.weapon, 'visee')]: Version.data(action.weapon).visee + 1 });
        }

        // Chat
        await new NephilimChat(action.actor)
            .withTemplate("systems/neph5e/feature/core/chat.hbs")
            .withData({
                actor: action.actor,
                sentence: game.i18n.localize('NEPHILIM.manoeuvreViserSentence').replaceAll("${arme}", action.weapon.name),
                richSentence: game.i18n.localize('NEPHILIM.manoeuvreViserSentence').replaceAll("${arme}", action.weapon.name),
                img: action.img,
                aim: Version.data(action.weapon).visee
            })
            .withFlags({})
            .create();

        return this;
    }

}