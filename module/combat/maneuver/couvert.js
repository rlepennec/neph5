import { Maneuver } from "./maneuver.js";
import { Game } from "../../common/game.js";
import { NephilimChat } from "../../common/chat.js";

export class Couvert extends Maneuver {

    /**
     * The identifier of the action.
     */
    static id = 'couvert';

    /**
     * The name of the action.
     */
    static name = 'Se mettre à couvert';

    /**
     * The tooltip of the action.
     */
    static tooltip = "Esquive +30% comme malus";

    /**
     * Indicates others actions can't be performed.
     */
    static exclusive = true;

    /**
     * Indicates the number of this action which can be performed.
     */
    static occurence = 1;

    /**
     * The effects produced by the action.
     */
    static effects = [
        {
            id: "couvert"
        }
    ];

    /**
     * @Override
     */
    sentence() {
        return "se met à couvert";
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
     *  - The token is not covered
     */
    allowed() {

        return this.token.combatant.getAllowedActionFromHistory(this) &&
            this.immobilized() === false &&
            this.covered() === false;

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

        // Resets the bonus of 'covered'
        await this.resetHidden();

        // Update the effect 'projete'
        await this.token.combatant.activateEffect(Game.effects.couvert);

        return;

    }

}