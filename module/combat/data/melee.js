export class Melee {

    /**
     * Constructor.
     * @param combatant The combatant for which to manage the weapon.
     */
     constructor(combatant) {
        this.combatant = combatant;
    }

    /**
     * @returns the current melee weapon.
     */
    weapon() {
        return this.weaponOf(this.combatant.actor);
    }

    /**
     * Gets the specified weapon of the specified actor.
     * @param actor The flags to check.
     * @returns the current melee weapon.
     */
    weaponOf(actor) {
        return actor.getWeapon("melee");
    }

    /**
     * @return the basic difficulty to use the weapon or undefined.
     */
    difficulty() {
        return this.combatant.actor.getSkill("melee");
    }

    /**
     * @returns true if the combatant is armed with a melee weapon.
     */
    isArmed() {
        return this.weapon() != undefined;
    }

}