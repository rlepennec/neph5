import { Game } from "../../common/game.js";

export class Melee {

    /**
     * Unarmed.
     */
    static none = 'none-melee';

    /**
     * Constructor.
     * @param combatant The combatant for which to manage the weapon.
     */
     constructor(combatant) {
        this.combatant = combatant;
    }

    /**
     * @returns the initial weapon combatant property.
     */
    static create() {
        return {
            refid: Melee.none
        };
    }

    /**
     * @returns the json data object used to render templates.
     */
    getRenderData() {
        const refid = this.combatant.data.flags.world.combat.melee.refid;
        const weapons = duplicate(Game.weapons.melee);
        weapons.forEach(function(p, index, array) {
            p.used = (p.id === refid);
        });
        return weapons;
    }

    /**
     * @returns the current melee weapon.
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
        const refid = flags.world.combat.melee.refid;
        return this.isArmedOf(flags) ? Game.weapons.melee.find(p => p.id === refid) : undefined;
    }

    /**
     * @return the basic difficulty to use the weapon or undefined.
     */
    difficulty() {
        const weapon = this.weapon();
        return weapon === undefined ? undefined : this.combatant.actor.getSkill(weapon.skill);
    }

    /**
     * Sets the specified melee weapon.
     * @param id The identifier of the melee weapon to set.
     * @returns the instance.
     */
    async set(id) {
        const flags = duplicate(this.combatant.data.flags);
        flags.world.combat.melee.refid = id;
        await this.combatant.update({['flags']: flags});
        return this;
    }

    /**
     * Unsets the melee weapon.
     * @returns the instance.
     */
    async unset() {
        return await this.set(Melee.none);
    }

    /**
     * Indicates if the specified combatant is armed.
     * @param flags The flags to check.
     * @returns true if the combatant is armed with a melee weapon.
     */
    isArmedOf(flags) {
        return flags.world.combat.melee.refid != Melee.none;
    }

    /**
     * @returns true if the combatant is armed with a melee weapon.
     */
    isArmed() {
        return this.isArmedOf(this.combatant.data.flags);
    }

}