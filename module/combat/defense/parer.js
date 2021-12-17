import { Defense } from "./defense.js";

export class Parer extends Defense {

    /**
     * The identifier of the action.
     */
    static id = 'parer';

    /**
     * The name of the action.
     */
    static name = 'Parer';

    /**
     * The type of the action.
     */
    static type = Defense.type;

    /**
     * The tooltip of the action.
     */
    static tooltip = "-2 dommages";

    /**
     * Indicates others actions can't be performed.
     */
    static exclusive = false;

    /**
     * Indicates the number of this action which can be performed.
     */
    static occurence = null;

    /**
     * The effects produced by the action.
     */
    static effects = [];

    /**
     * Indicates a target must be selected.
     */
    static targeted = false;

    /**
     * The attack modifier.
     */
    static attack = null;

    /**
     * The defense modifiers.
     *   - For each defense roll
     *   - For each additional roll after the first one
     */
    static defense = {
        basic: 0,
        additional: -2
    };

    /**
     * The impact modifier.
     */
    static impact = null;

    /**
     * The impact protection.
     *   - If the defense roll is a success
     *   - If the defense roll is a fumble
     */
    static protection = {
        success: -2,
        fumble: 0
    };

    /**
     * @Override
     */
    sentence() {
        return "pare l'attaque";
    }

    /**
     * @Override
     * 
     * To be allowed a defense action must validate the following assertions:
     *  - The history of the round allows this action
     *  - The token is not immobilized
     *  - The attack is a melee action or a frappe
     */
    allowed() {

        return super.allowed() &&
            this.isStrike() &&
            super.imArmed();

    }

    /**
     * @Override
     */
    difficulty() {
        const skill = this.token.actor.getSkill('melee');
        const modifier = this.weaponsModifier();
        return super.difficulty() + skill + modifier;
    }

}