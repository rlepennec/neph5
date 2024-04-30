/**
 * This class provides features to manage combat history. It's used only in combat,
 * that's why history data is registered in combatant flags, to allow or forbid
 * manoeuver, according to the previous manoeuvers of the round.
 */
export class History {

/*
    actor?.token?.combatant.
        combat.started
        turn 0
        round 0 +
        par round*/

    /**
     * Constructor.
     * @param actor The actor object.
     */
    constructor(actor) {
        this.actor = actor;
    }

    /**
     * @param actor The actor object for which to clear the history.
     */
    static async clear(actor) {

        // Assert the actor is a combatant
        const combatant = actor?.token?.combatant;
        if (combatant == null) {
            return;
        }

        // Add the specified manoeuver
        const flags = foundry.utils.duplicate(combatant.data.flags);
        flags.history = [];
        await combatant.update({ ['flags']: flags });

    }

    /**
     * @param actor     The actor object for which to check the manoeuver.
     * @param manoeuver The manoeuver identifier to check.
     * @returns true if the manoeuver is allowed.
     */
    allowed(actor, manoeuver) {

        // Assert the actor is a combatant
        const combatant = actor?.token?.combatant;
        if (combatant == null) {
            return false;
        }

        // Allowed if history is empty
        const history = combatant.data.flags.history;
        if (history.length === 0) {
            return true;
        }

        // 

        // Process the exclusive manoeuver if exists. Following rules are applied:
        //   - Manoeuvers other than the exclusive one can't be performed during a round
        //   - A manoeuver can't be perform more than times during a round
        const exclusive = history.find(m => m.exclusive === true);
        if (exclusive != null) {
            if (manoeuver.id !== exclusive.id) {
                return false;
            } else {
                return history.length < manoeuver.times;
            }
        }



    }

    /**
     * @param actor     The actor object for which to add the manoeuver.
     * @param manoeuver The manoeuver identifier to add.
     */
    static async push(actor, manoeuver) {

        // Assert the actor is a combatant
        const combatant = actor?.token?.combatant;
        if (combatant == null) {
            return;
        }

        // Add the specified manoeuver
        const flags = foundry.utils.duplicate(combatant.data.flags);
        flags.history.push(manoeuver);
        await combatant.update({ ['flags']: flags });

    }





    /**
     * @returns the 
     */
    size() {

    }

    /**
     * @returns the actor combatant object.
     */
    combatant() {
        return this.actor?.token?.combatant;
    }

    /**
     * @returns the current combat round or null if combat is not started.
     */
    round() {
        const combatant = this.combatant();
        return combatant?.combat.started === true ? combatant.combat.round : null;
    }

}