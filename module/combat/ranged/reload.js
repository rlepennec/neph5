import { Maneuver } from "../maneuver/maneuver.js";
import { NephilimChat } from "../../common/chat.js";

export class Reload extends Maneuver {

    /**
     * The identifier of the action.
     */
    static id = 'reload';

    /**
     * The name of the action.
     */
    static name = 'Reload';

    /**
     * The tooltip of the action.
     */
    static tooltip = "Recharge toutes les munitions de son arme";

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
        return "recharche son arme " + this.weapon.name;
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
     * To be allowed a reload action must validate the following assertions:
     *  - The history of the round allows this action
     *  - The character is not immobilized
     *  - Some ammunitions can be added
     *  - The weapon needs at least more a complete round to be reloaded
     */
    allowed() {
        return this.token.combatant.getAllowedActionFromHistory(this) &&
            this.immobilized() === false &&
            this.weapon.data.data.ranged.utilise > 0 &&
            this.weapon.data.data.ranged.vitesse > 0;
    }


    /**
     * @Override
     */
    async doit(action) {

        // Displays the action description as chat message
        await new NephilimChat(this.actor)
            .withTemplate("systems/neph5e/templates/dialog/combat/combat-action.hbs")
            .withData({
                actor: this.actor,
                action: action
            })
            .create();

        // Resets the bonus of 'visee'
        await this.resetVisee();

        // Increase the number of round or reload
        const reload = this.weapon.data.data.ranged.reload + 1;
        await this.weapon.update({ ['data.ranged.reload']: reload });

        // Increases the number of ammunitions at the end of the reloading
        if (this.weapon.data.data.ranged.vitesse <= reload) {
            await this.weapon.update({ ['data.ranged.utilise']: 0 });
            await this.weapon.update({ ['data.ranged.reload']: 0 });
        }

        return this;

    }

}