import { Defense } from "./defense.js";

export class Esquiver extends Defense {

    /**
     * The identifier of the action.
     */
    static id = 'esquiver';

    /**
     * The name of the action.
     */
    static name = 'Esquiver';

    /**
     * The type of the action.
     */
    static type = Defense.type;

    /**
     * The tooltip of the action.
     */
    static tooltip = "Aucun dommages, se désengage, ne peut attaquer";

    /**
     * Indicates others actions can't be performed.
     */
    static exclusive = true;

    /**
     * Indicates the number of this action which can be performed.
     */
    static occurence = 1;

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
        additional: null
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
        success: -20,
        fumble: 0
    };

    /**
     * @Override
     */
    sentence() {
        return "esquive l'attaque";
    }

    /**
     * @Override
     */
    difficulty() {
        const skill = this.token.actor.getSkill('esquive');
        return super.difficulty() + skill;
    }

}