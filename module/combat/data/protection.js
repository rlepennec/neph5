import { Game } from "../../common/game.js";

export class Protection {

    /**
     * Constructor.
     * @param combatant The combatant for which to manage the protection.
     */
     constructor(combatant) {
        this.combatant = combatant;
    }

    /**
     * Gets the current protection of the specified combatant.
     * @param actor The actor to check.
     * @returns the current protection.
     */
    getOf(actor) {
        for (let item of actor.items.values()) {
            if (item.type === "armure") {
                return item;
            }
        }
        return undefined;
    }

    /**
     * Gets the protection value used versus the specified weapon.
     * @param weapon The weapon used to strike.
     * @returns the value of the protection against the strike.
     */
    getProtection(weapon) {
        const armor = this.getOf(this.combatant.actor);
        return this.getProtectionVersusArmor(weapon, armor);
    }

    /**
     * Gets the protection value used versus the specified weapon for the specified combatant.
     * @param target The target which receives the dommages to watch.
     * @param weapon The weapon used to strike.
     * @returns the value of the protection against the strike.
     */
    getProtectionOf(target, weapon) {
        const armor = this.getOf(target.token.combatant.actor);
        return this.getProtectionVersusArmor(weapon, armor);
    }

    getProtectionVersusArmor(weapon, armor) {
        if (armor === undefined) {
            return 0;
        }
        if (weapon === null) {
            return armor.data.data.contact;
        }
        if (weapon.data.magique) {
            return armor.data.data.magique;
        }
        switch (weapon.data.skill) {
            case Game.skills.melee.id:
                return armor.data.data.contact;
            case Game.skills.trait.id:
                return armor.data.data.trait;
            case Game.skills.feu.id:
            case Game.skills.lourde.id:
                return armor.data.data.feu;
        }
    }

}