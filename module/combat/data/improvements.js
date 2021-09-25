import { Game } from "../../common/game.js";

export class Improvements {

    /**
     * Constructor.
     * @param combatant The combatant for which to manage the improvements.
     */
     constructor(combatant) {
        this.combatant = combatant;
    }

    /**
     * @returns the initial improvements combatant property.
     */
    static create() {
        return {
            initiative: 0,
            choc: 0,
            damages: 0
        };
    }

    /**
     * @returns the json data object used to render templates.
     */
    getRenderData() {
        return {
            initiative: this.get(Game.improvements.initiative),
            choc: this.get(Game.improvements.choc),
            damages: this.get(Game.improvements.damages)
        }
    }

    /**
     * Gets the specified improvement value.
     * @param improvement The improvement to set. 
     * @returns the improvement value.
     */
    get(improvement) {
        return this.getOf(this.combatant.data.flags, improvement);
    }

    /**
     * Gets the specified improvement value for the specified flags.
     * @param flags       The flags to check.
     * @param improvement The improvement to set. 
     * @returns the improvement value.
     */
    getOf(flags, improvement) {
        return flags.world.combat.improvements[improvement.id];
    }

    /**
     * Sets the specified improvement value.
     * @param improvement The improvement to set.
     * @param value The value to set. 
     * @returns the instance.
     */
    async set(improvement, value) {
        const flags = duplicate(this.combatant.data.flags);
        flags.world.combat.improvements[improvement.id] = value;
        await this.combatant.update({['flags']: flags});
        return this;
    }

}