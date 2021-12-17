import { Maneuver } from "../maneuver/maneuver.js";
import { NephilimChat } from "../../common/chat.js";

export class Aim extends Maneuver {

    /**
     * The identifier of the action.
     */
    static id = 'aim';

    /**
     * The name of the action.
     */
    static name = 'Aim';

    /**
     * The tooltip of the action.
     */
    static tooltip = "+20% par round";

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
        return "ajuste son tir sur " + this.target.name + " avec " + this.weapon.name;
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
     * To be allowed a aim action must validate the following assertions:
     *  - The history of the round allows this action
     *  - Exactly one target has been selected
     *  - The token is armed with a ranged weapon
     *  - The number of rounds of visee is lesser than 3
     */
    allowed() {

        return this.token.combatant.getAllowedActionFromHistory(this) &&
            this.target != null &&
            this.immobilized() === false &&
            this.weapon.data.data.ranged.visee < 3;

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

        // Resets the bonus of 'reload'
        await this.resetReload();

        // Resets the bonus of 'hidden'
        await this.resetHidden();

        // Increase the number of round
        const visee = this.weapon.data.data.ranged.visee + 1;
        await this.weapon.update({ ['data.ranged.visee']: visee });

        return this;

    }

}