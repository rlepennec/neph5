import { AbstractManoeuver } from "./abstractManoeuver.js";
import { ActiveEffects } from "../../core/effects.js";
import { Constants } from "../../../module/common/constants.js";
import { NephilimChat } from "../../../module/common/chat.js";

/**
 * Se relever : quitter le sol. Elle se joue d'office, sans dé et sans cible, mais elle occupe
 * le combattant — c'est l'action de son round, comme un rechargement. Impossible tant qu'on est
 * tenu : il faut d'abord se libérer de la prise.
 */
export class Getup extends AbstractManoeuver {

    static ID = "getup";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Getup.ID, Constants.BRAWL, action);
        this.target = false;
        this.automatic = true;
    }

    /**
     * @Override
     */
    isAllowed(action) {
        return action.actor.projete === true && action.actor.immobilise !== true;
    }

    /**
     * @Override
     */
    async apply(action) {

        // Forbidden
        if (this.canBePerformed(action) === false) {
            return;
        }

        await action.actor.deactivateEffect(ActiveEffects.PROJETE.name);

        const sentence = game.i18n.localize(AbstractManoeuver.clef(Getup.ID, "Sentence"));
        await new NephilimChat(action.actor)
            .withTemplate("systems/neph5e/feature/core/chat.hbs")
            .withData({
                actor: action.actor,
                sentence: sentence,
                richSentence: sentence
            })
            .withFlags({})
            .create();

        return this;
    }

}
