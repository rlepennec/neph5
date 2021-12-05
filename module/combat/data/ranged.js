export class Ranged {

    /**
     * Constructor.
     * @param combatant The combatant for which to manage the weapon.
     */
     constructor(combatant) {
        this.combatant = combatant;
    }

    /**
     * @returns the initial ranged weapon combatant property.
     */
    static create() {
        return {
            utilise: 0,
            reload: 0,
            visee: 0
        };
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
        const lourde = actor.getWeapon("lourde");
        const feu = actor.getWeapon("feu");
        const trait = actor.getWeapon("trait");
        return lourde != undefined ? lourde : feu != undefined ? feu : trait;
    }

    /**
     * Indicates if the current weapon support the specified action.
     * @param action The action to check.
     * @returns true if the action is supported.
     */
    support(action) {
        const weapon = this.weapon();
        if (weapon === undefined) {
            return false;
        }
        const w = weapon.data.data.ranged.actions;
        const isP = w[action.constructor.id];
        return isP;
    }

    /**
     * @return the basic difficulty to use the weapon according to the skill.
     */
    difficulty() {
        const weapon = this.weapon();
        return this.combatant.actor.getSkill(weapon.data.data.skill);
    }

    /**
     * @returns the modifier due to each round of 'visee' (+20%).
     */
    modifier() {
        return 2 * this.combatant.data.flags.world.combat.ranged.visee;
    }

    /**
     * @returns true if the combatant is armed with a ranged weapon.
     */
    isArmed() {
        return this.weapon() != undefined;
    }

}