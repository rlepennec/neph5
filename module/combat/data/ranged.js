import { Game } from "../../common/game.js";

export class Ranged {

    /**
     * Unarmed.
     */
     static none = 'none-ranged';

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
            refid: Ranged.none,
            chargeur: 0,
            reload: 0,
            visee: 0
        };
    }

    /**
     * @returns the json data object used to render templates.
     */
    getRenderData() {
        const refid = this.combatant.data.flags.world.combat.ranged.refid;
        const weapons = duplicate(Game.weapons.ranged);
        weapons.forEach(function(p, index, array) {
            p.used = (p.id === refid);
        });
        return weapons;
    }

    /**
     * @returns the current ranged weapon.
     */
    weapon() {
        return this.weaponOf(this.combatant.data.flags);
    }

    /**
     * Gets the specified weapon of the specified flags.
     * @param flags The flags to check.
     * @returns the current melee weapon.
     */
    weaponOf(flags) {
        const refid = flags.world.combat.ranged.refid;
        return this.isArmedOf(flags) ? Game.weapons.ranged.find(p => p.id === refid) : undefined;
    }

    /**
     * Indicates if the current weapon support the specified action.
     * @param action The action to check.
     * @returns true if the action is supported.
     */
    support(action) {
        const weapon = this.weapon();
        return weapon === undefined ? false : weapon.actions.includes(action.constructor.id);
    }

    /**
     * @return the basic difficulty to use the weapon according to the skill.
     */
    difficulty() {
        const weapon = this.weapon();
        return this.combatant.actor.getSkill(weapon.skill);
    }

    /**
     * @returns the modifier due to each round of 'visee'.
     */
    modifier() {
        return 2 * this.combatant.data.flags.world.combat.ranged.visee;
    }

    /**
     * Sets the specified ranged weapon.
     * @param id The identifier of the ranged weapon to set.
     * @returns the instance.
     */
    async set(id) {
        const flags = duplicate(this.combatant.data.flags);
        const weapon = Game.weapons.ranged.find(w => w.id === id);
        if (weapon.id != Ranged.none && weapon?.munitions === undefined) {
            ui.notifications.warn("ERREUR: Munitions pour l'arme " + id + " pour le combatant " + this?.combatant?.id);
        }
        const munitions = weapon?.munitions ?? 0;
        flags.world.combat.ranged = {
            refid: id,
            chargeur: munitions,
            reload: 0,
            visee: 0
        }
        await this.combatant.update({['flags']: flags});
        return this;
    }

    /**
     * Indicates if the specified combatant is armed.
     * @param flags The flags to check.
     * @returns true if the combatant is armed with a ranged weapon.
     */
    isArmedOf(flags) {
        return flags.world.combat.ranged.refid != Ranged.none;
    }

    /**
     * @returns true if the combatant is armed with a ranged weapon.
     */
    isArmed() {
        return this.isArmedOf(this.combatant.data.flags);
    }

}