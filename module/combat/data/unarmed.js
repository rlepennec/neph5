export class Unarmed {

    /**
     * Constructor.
     * @param combatant The combatant for which to manage the weapon.
     */
    constructor(combatant) {
        this.combatant = combatant;
    }

    /**
     * @returns the natural weapon.
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
        return actor.getWeapon("martial");
    }

    /**
     * @return the basic difficulty to use the natural weapon.
     */
    difficulty() {
        return this.combatant.actor.getSkill("martial");
    }

}