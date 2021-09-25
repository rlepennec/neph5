import { Game } from "../../common/game.js";
import { Action } from "../actions/action.js";

/**
 * This class manages the history of the actions performed by a token during a round.
 */
export class History {

    /**
     * Constructor.
     * @param combatant The combatant for which to manage the history of the round.
     */
    constructor(combatant) {
        this.combatant = combatant;
    }

    /**
     * @returns the initial history token property.
     */
    static create() {
        return {
            round: null,
            attacks: [],
            defenses: [],
            exclusive: null
        };
    }

    /**
     * Indicates if the specified action is allowed according to the current history.
     *   - A exclusive action forbids other actions to be pushed.
     *   - An pushed attack forbids the other attacks to be pushed.
     *   - A non exclusive attack can be pushed with different non exclusive defenses.
     *   - An action can't not been pushed more than the occurence if defined.
     * @param action The action to test.
     * @returns true if the action is allowed.
     */
    allowed(action) {

        // Initialization
        const attacks = this.combatant.data.flags.world.combat.history.attacks;
        const defenses = this.combatant.data.flags.world.combat.history.defenses;

        // Any action can be pushed if history is empty.
        if (attacks.length === 0 && defenses.length === 0) {
            return true;
        }

        // If the action is exclusive, only the same action is allowed. The history
        // is not empty, so the registered action must be compared.
        const exclusive = this.getExclusive();
        if (action.constructor.exclusive) {

            // Forbids to push two differents exclusive actions.
            if (exclusive != undefined && exclusive.id != action.constructor.id) {
                return false;
            }

            // Forbids to push more than the occurence id defined.
            return action.constructor.occurence === undefined || this.sizeOf(action) < action.constructor.occurence;

        }

        // The action is not exclusive. Forbids to push this action if an exclusive
        // action is already registered.
        if (exclusive != undefined) {
            return false;
        }

        // The action is an defense. Forbids to push more than the occurence id defined.
        if (this.isDefense(action)) {
            return action.constructor.occurence === null || this.sizeOf(action) < action.constructor.occurence;
        }

        // The action is an attack. Forbids to push more than one attack.
        if (attacks.some(a => a.id != action.constructor.id)) {
            return false;
        }

        // Forbids to push more than the occurence id defined.
        return action.constructor.occurence === null || this.sizeOf(action) < action.constructor.occurence;

    }

    /**
     * Gets the number of the specified action.
     * @param action The action to check.
     * @returns the number of registration.
     */
    sizeOf(action) {

        // Retrieve the array in which to check the action
        const array = action.constructor.type === Action.Types.defense.id ? 
            this.combatant.data.flags.world.combat.history.defenses : 
            this.combatant.data.flags.world.combat.history.attacks;

        // Count the occurences of the action
        return array.filter(a => a.constructor.id != action.constructor.id).length;

    }

    /**
     * @returns the exclusive action or undefined.
     */
    getExclusive() {
        let exclusive = this.combatant.data.flags.world.combat.history.attacks.find(a => a.exclusive);
        if (exclusive === undefined) {
            exclusive = this.combatant.data.flags.world.combat.history.defenses.find(a => a.exclusive);
        }
        return exclusive;
    }

    /**
     * Pushes the specified action in the history.
     * @param action The action to push.
     * @returns the instance.
     */
    async push(action) {

        // Retrieve the combat flags
        const flags = duplicate(this.combatant.data.flags);

        // Retrieve the array in which to push the action
        const array = action.type === Action.Types.defense.id ? 
            flags.world.combat.history.defenses : 
            flags.world.combat.history.attacks;

        // Push the action
        array.push(action);

        // Update and returns the updated combat flags
        await this.combatant.update({['flags']: flags});
        return this;

    }

    /**
     * Refreshes the history.
     */
    async refresh() {

        // Initialization
        const flags = duplicate(this.combatant.data.flags);
        const now = game.combat.current.round;

        // Removes all the actions if the current round has expired
        if (flags.world.combat.history.round != now) {
            flags.world.combat.history.round = now;
            flags.world.combat.history.attacks = [];
            flags.world.combat.history.defenses = [];
        }

        // Update the combatant
        await this.combatant.update({['flags']: flags});
        return this;

    }

    /**
     * Clears the history.
     * @returns the instance.
     */
    async clear() {
        const flags = duplicate(this.combatant.data.flags);
        flags.world.combat.history.attacks = [];
        flags.world.combat.history.defenses = [];
        await this.combatant.update({['flags']: flags});
        return this;
    }

    /**
     * Indicates if the specified action is an attack.
     * @param action The action to check.
     * @return true if the action is an attack.
     */
    isAttack(action) {
        return action.constructor.type != Action.Types.defense.id;
    }

    /**
     * Indicates if the specified action is a defense.
     * @param action The action to check.
     * @return true if the action is an defense.
     */
     isDefense(action) {
        return action.constructor.type === Action.Types.defense.id;
    }

}