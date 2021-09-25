import { Game } from "../../common/game.js";

export class Unarmed {

    /**
     * Unarmed.
     */
    static none = 'none';

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
            refid: Unarmed.none
        };
    }

    /**
     * @returns the json data object used to render templates.
     */
    getRenderData() {
        const refid = this.combatant.data.flags.world.combat.unarmed.refid;
        const weapons = duplicate(Game.weapons.unarmed);
        weapons.forEach(function(p, index, array) {
            p.used = (p.id === refid);
        });
        return weapons;
    }

    /**
     * @returns the current natural weapon.
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
        const refid = flags.world.combat.unarmed.refid;
        return Game.weapons.unarmed.find(p => p.id === refid);
    }

    /**
     * @return the basic difficulty to use the natural weapon.
     */
    difficulty() {
        const weapon = this.weapon();
        return this.combatant.actor.getSkill(weapon.skill);
    }

    /**
     * Sets the specified natural weapon.
     * @param id The identifier of the natural weapon to set.
     * @returns the instance.
     */
    async set(id) {
        const flags = duplicate(this.combatant.data.flags);
        flags.world.combat.unarmed.refid = id;
        await this.combatant.update({['flags']: flags});
        return this;
    }

}