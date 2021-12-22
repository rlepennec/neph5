import { Action } from "../action.js";
import { Game } from "../../common/game.js";
import { NephilimChat } from "../../common/chat.js";

export class Ranged extends Action {

    /**
     * The type of the action.
     */
    static type = Action.Types.ranged.id;

    /**
     * Indicates a target must be selected.
     */
    static targeted = true;

    /**
     * @Override
     */
    difficulty() {

        // Apply the basic skill and the specified modifier
        const skill = this.actor.getSkill(this.weapon.data.data.skill);
        let difficulty = skill + this.constructor.attack;

        // Apply the wounds modifier
        difficulty = difficulty + this.token.combatant.getWoundsModifier('physique');

        // Apply malus if disoriented
        if (this.effectIsActive(Game.effects.desoriente)) {
            difficulty = difficulty + Game.effects.desoriente.modifier;
        }

        // Apply bonus if target immobilized
        if (this.effectIsActiveOnTarget(Game.effects.immobilise)) {
            difficulty = difficulty + Game.effects.immobilise.modifier;
        }

        // Apply malus is target is covered
        if (this.effectIsActiveOnTarget(Game.effects.couvert)) {
            difficulty = difficulty + Game.effects.couvert.modifier + this.target.dodge;
        }

        // Apply malus is target is hidden
        if (this.effectIsActiveOnTarget(Game.effects.cache)) {
            difficulty = difficulty + Game.effects.cache.modifier + this.target.dodge;
        }

        // Apply bonus for each round of 'aim'
        difficulty = difficulty + 2 * this.weapon.data.data.ranged.visee;

        // Returns the difficulty of the action
        return difficulty;

    }

    /**
     * @Override
     */
    impact() {
        return this.weapon.data.data.damages + this.constructor.impact;
    }

    /**
     * @Override
     * 
     * To be allowed a melee action must validate the following assertions:
     *  - The history of the round allows this action
     *  - Exactly one target has been selected
     *  - The token is not immobilized
     *  - The token is armed with a ranged weapon
     *  - The weapon supports the action
     *  - Enough ammunitions to perform the action
     *  - The token is not hidden
     */
    allowed() {
        return this.token.combatant.getAllowedActionFromHistory(this);
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

        // Fetches the weapon used to perform the action

        // Resets all progressing actions
        await this.resetProgress();

        // Resets the bonus of 'hidden'
        await this.resetHidden();

        // Decreases the ammunition number
        await this.decreaseAmmunitions();

        // Rolls dices
        await this.updateRoll(action);

        // Increases impact if critical success
        this.updateImpact(action);

        // Adds flags for the chat message to be hooked if necessary
        const flags = action.roll.success ?
            {
                neph5e: {
                    attack: action
                }
            } : {};

        // Displays the action result. The chat message will be hooked if flags exist 
        await new NephilimChat(this.actor)
            .withTemplate("systems/neph5e/templates/dialog/combat/combat-result.hbs")
            .withData({
                action: action,
                result: {
                    roll: this.attackResult(action.roll),
                    protection: this.target.token.combatant.actor.getProtectionVersus(this.weapon.data)
                }
            })
            .withFlags(flags)
            .create();

        return this;

    }

    /**
     * Decreases the number of munitions according to action.
     * @returns the instance.
     */
    async decreaseAmmunitions() {
        if (this.weapon.data.data.ranged.vitesse > 0) {
            const utilise = Math.min(this.weapon.data.data.ranged.munitions, this.weapon.data.data.ranged.utilise + this.constructor.used);
            await this.weapon.update({ ['data.ranged.utilise']: utilise });
        }
        return this;
    }

}