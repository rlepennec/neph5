import { Maneuver } from "./maneuver.js";
import { Game } from "../../common/game.js";
import { NephilimChat } from "../../common/chat.js";

export class Relever extends Maneuver {

    /**
     * The identifier of the action.
     */
    static id = 'relever';

    /**
     * The name of the action.
     */
    static name = 'Se relever';

    /**
     * The tooltip of the action.
     */
    static tooltip = "Supprime l'effet à terre";

    /**
     * Indicates others actions can't be performed.
     */
    static exclusive = false;

    /**
     * Indicates the number of this action which can be performed.
     */
    static occurence = 1;

    /**
     * The effects produced by the action.
     */
    static effects = [];

    /**
     * @Override
     */
    sentence() {
        return "se relève";
    }

    /**
     * @Override
     */
    difficulty() {
        return undefined;
    }

    /**
     * @Override
     */
    impact() {
        return undefined;
    }

    /**
     * @Override
     * 
     * To be allowed a relever action must validate the following assertions:
     *  - The history of the round allows this action
     *  - The token is not immobilized
     *  - The token is projete
     */
    allowed() {

        return this.token.combatant.getAllowedActionFromHistory(this) &&
            this.immobilized() === false &&
            this.effectIsActive(Game.effects.projete);

    }

    /**
     * @Override
     */
    async doit(action) {

        // Displays the action description as chat message
        await new NephilimChat(this.actor)
            .withTemplate("systems/neph5e/templates/dialog/combat/combat-action.hbs")
            .withData({
                action: action
            })
            .create();

        // Resets the bonus of 'visee'
        await this.resetVisee();

        // Resets the bonus of 'reload'
        await this.resetReload();

        // Update the effect 'projete'
        await this.token.combatant.deactivateEffect(Game.effects.projete);

        return;

    }

}