import { Defense } from "./defense.js";
import { Desarmement } from "../melee/desarmement.js";

export class Desarmer extends Defense {

    /**
     * The identifier of the action.
     */
    static id = 'desarmer';

    /**
     * The name of the action.
     */
    static name = 'Désarmer';

    /**
     * The type of the action.
     */
    static type = Defense.type;

    /**
     * The tooltip of the action.
     */
    static tooltip = "-2 dommages et desarme ou +2 dommages";

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
    static impact = null;

    /**
     * The impact protection.
     *   - If the defense roll is a success
     *   - If the defense roll is a fumble
     */
    static protection = {
        success: -4,
        fumble: 2
    };

    /**
     * @Override
     */
    sentence() {
        return "pare l'attaque et tente de désarmer son adversaire";
    }

    /**
     * @Override
     * 
     * To be allowed a defense action must validate the following assertions:
     *  - The history of the round allows this action
     *  - The token is not immobilized
     *  - The attack is a melee action
     *  - The token is armed with a melee weapon
     */
    allowed() {

        return super.allowed() &&
            this.isArmedStrike() &&
            this.imArmed();

    }

    /**
     * @Override
     */
    difficulty() {
        const skill = this.token.actor.getSkill('melee');
        const modifier = this.weaponsModifier();
        return super.difficulty() + skill + modifier;
    }

    /**
     * @Override
     */
    async onSuccess(action) {
        const targetedWeapon = this.attack.actor.weapon._id;
        const target = this.attack.actor;
        target.id = this.attack.actor.tokenId;
        target.token = this.token;
        target.targetedWeapon = targetedWeapon;
        const weapon = this.getFirstMeleeWeapon();
        const strike = new Desarmement(this.actor, this.token, weapon, target);
        const data = strike.data();
        data.difficulty = data.difficulty + action.modifier;
        return await strike.doit(data);
    }

}