import { Defense } from "./defense.js";
import { Standard } from "../melee/standard.js";
import { Frappe } from "../unarmed/frappe.js";

export class Contrer extends Defense {

    /**
     * The identifier of the action.
     */
    static id = 'contrer';

    /**
     * The type of the action.
     */
    static type = Defense.type;

    /**
     * The tooltip of the action.
     */
    static tooltip = "-2 dommages et attaque ou +2 dommages";

    /**
     * Indicates others actions can't be performed.
     */
    static exclusive = false;

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
        basic: -4,
        additional: -2
    };

    /**
     * The impact modifier.
     */
    static impact = 0;

    /**
     * The impact protection.
     *   - If the defense roll is a success
     *   - If the defense roll is a fumble
     */
    static protection = {
        success: -2,
        fumble: 2
    };

    /**
     * @Override
     */
    sentence() {
        return "neutralise l'attaque et riposte";
    }

    /**
     * @Override
     */
    difficulty() {
        const skill = this.token.actor.getSkill('melee');
        const modifier = this.weaponsModifier();
        return super.difficulty() + skill + modifier;
    }

    allowed() {

        return super.allowed() &&
            this.isStrike() &&
            this.imArmed();

    }

    /**
     * @Override
     */
    async onSuccess(action) {
        const target = this.attack.actor;
        target.id = this.attack.actor.tokenId;
        target.token = this.token;
        const weapon = this.getFirstMeleeWeapon();
        const strike = this.imArmed() ? new Standard(this.actor, this.token, weapon, target) : new Frappe(this.actor, this.token, weapon, target);
        const data = strike.data();
        data.difficulty = data.difficulty + action.modifier;
        return await strike.doit(data);
    }

}