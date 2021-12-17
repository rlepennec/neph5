import { Defense } from "./defense.js";

export class Bloquer extends Defense {

    /**
     * The identifier of the action.
     */
    static id = 'bloquer';

    /**
     * The name of the action.
     */
    static name = 'Bloquer';

    /**
     * The type of the action.
     */
    static type = Defense.type;

    /**
     * The tooltip of the action.
     */
    static tooltip = "-2 dommages sans malus pour les défenses suivantes, ne peut attaquer";

    /**
     * Indicates others actions can't be performed.
     */
    static exclusive = true;

    /**
     * Indicates the number of this action which can be performed.
     */
    static occurence = null;

    /**
     * Indicates a target must be selected.
     */
    static targeted = false;

    /**
     * The effects produced by the action.
     */
    static effects = [];

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
        additional: 0
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
        return "bloque l'attaque";
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