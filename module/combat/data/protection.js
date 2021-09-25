import { Game } from "../../common/game.js";

export class Protection {

    /**
     * Unprotected.
     */
    static none = 'none-protection';

    /**
     * Constructor.
     * @param combatant The combatant for which to manage the protection.
     */
     constructor(combatant) {
        this.combatant = combatant;
    }

    /**
     * @returns the initial protection combatant property.
     */
    static create() {
        return {
            refid: Protection.none
        };
    }

    /**
     * @returns the json data object used to render templates.
     */
    getRenderData() {
        const refid = this.combatant.data.flags.world.combat.protection.refid;
        const protections = duplicate(Game.protections);
        protections.forEach(function(p, index, array) {
            p.used = (p.id === refid);
        });
        return protections;
    }

    /**
     * @returns the current protection.
     */
    get() {
        return this.getOf(this.combatant.data.flags);
    }

    /**
     * Gets the current protection of the specified combatant.
     * @param flags The flags to check.
     * @returns the current protection.
     */
    getOf(flags) {
        const refid = flags.world.combat.protection.refid;
        return Game.protections.find(p => p.id === refid);
    }

    /**
     * Sets the specified protection.
     * @param id The identifier of the protection to set.
     * @returns the instance.
     */
    async set(id) {
        const flags = duplicate(this.combatant.data.flags);
        flags.world.combat.protection.refid = id;
        await this.combatant.update({['flags']: flags});
        return this;
    }

    /**
     * Gets the protection value used versus the specified weapon.
     * @param weapon The weapon used to strike.
     * @returns the value of the protection against the strike.
     */
    getProtection(weapon) {
        const protection = this.get();
        switch (weapon.skill) {
            case Game.skills.melee.id:
            case Game.skills.martial.id:
                return protection.contact;
            case Game.skills.trait.id:
                return protection.trait;
            case Game.skills.feu.id:
            case Game.skills.lourde.id:
                return protection.feu;
        }
    }

    /**
     * Gets the protection value used versus the specified weapon for the specified combatant.
     * @param flags  The flags to watch.
     * @param weapon The weapon used to strike.
     * @returns the value of the protection against the strike.
     */
    getProtectionOf(flags, weapon) {
        const protection = this.getOf(flags);
        switch (weapon.skill) {
            case Game.skills.melee.id:
            case Game.skills.martial.id:
                return protection.contact;
            case Game.skills.trait.id:
                return protection.trait;
            case Game.skills.feu.id:
            case Game.skills.lourde.id:
                return protection.feu;
        }
    }

}