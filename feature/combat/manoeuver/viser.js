import { AbstractManoeuver } from "./abstractManoeuver.js";
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
    constructor() {
        super(Viser.ID, Constants.TACTIC);
        this.withImpact({fix: 0});
        this.withoutClearViser();
    }

    /**
     * @param action The action for which to process the visee.
     * @returns the current modifier.
     */
    modifier(action) {

        // On the current target
        if (action.weapon.system.cible === action.target?.id) {
            switch (action.weapon.system.type) {
                case Constants.FEU:
                    return action.weapon.system.visee === null ? -40 : action.weapon.system.visee * 20;
                case Constants.TRAIT:
                    return action.weapon.system.visee * 20;
            }

        // An other target
        } else {
            switch (action.weapon.system.type) {
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
    canBePerformed(action) {
        return action.actor.token != null &&
               action.target != null &&
              (action.weapon.system.cible !== action.target.id || action.weapon.system.visee < 3);
        
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
        if (action.weapon.system.cible !== action.target.id) {
            await action.weapon.update({ ['system.cible']: action.target.id });
            await action.weapon.update({ ['system.visee']: 1 });
        } else {
            await action.weapon.update({ ['system.visee']: action.weapon.system.visee + 1 });
        }

        // Chat
        await new NephilimChat(action.actor)
            .withTemplate("systems/neph5e/feature/core/actionChat.hbs")
            .withData({
                actor: action.actor,
                sentence: game.i18n.localize('NEPH5E.manoeuvres.viser.sentence').replaceAll("${arme}", action.weapon.name),
                richSentence: game.i18n.localize('NEPH5E.manoeuvres.viser.sentence').replaceAll("${arme}", action.weapon.name),
                img: action.img
            })
            .withFlags({})
            .create();

        return this;
    }

}