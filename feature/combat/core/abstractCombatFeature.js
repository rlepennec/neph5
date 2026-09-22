import { AbstractFeature } from "../../core/abstractFeature.js";
import { CombatHistory } from "./combatHistory.js";
import { ManoeuverBuilder } from "../manoeuver/manoeuverBuilder.js";

export class AbstractCombatFeature extends AbstractFeature {

    /**
     * @returns the maneuvers already played this round by the acting actor, empty array if
     *          the actor isn't engaged in a combat.
     */
    get history() {
        return CombatHistory.thisRound(this.actor);
    }

    /**
     * @returns true si cette action n'a plus aucune manœuvre à proposer ce round — chacune a
     *          déjà atteint sa propre limite de répétitions, ou une défense exclusive
     *          (noAttack=true) a verrouillé le round entier.
     */
    get actionsExhausted() {
        return Object.keys(this.data.manoeuvers ?? {}).length === 0;
    }

    difficulty(parameters) {

        const data = this.data;

        return AbstractCombatFeature.toInt(data?.base?.difficulty)
            + AbstractFeature.toInt(parameters?.modifier)
            + AbstractFeature.toInt(parameters?.approche)
            + AbstractFeature.toInt(parameters?.blessures, data.blessures)
            + AbstractCombatFeature.toInt(data?.foeOnGround?.modifier)
            + AbstractCombatFeature.toInt(data?.onGround?.modifier)
            + AbstractCombatFeature.toInt(data?.stunned?.modifier)
            + AbstractCombatFeature.toInt(data?.attack?.modifier)
            + AbstractCombatFeature.toInt(data?.nextDefense?.modifier)
            + AbstractCombatFeature.toInt(data.visee)
            + this.manoeuverModifier(parameters)
            + this.weaponModifier(data?.weapon);

    }

    /**
     * @param weapon The weapon object used for the attack.
     * @returns the attack modififer.
     */
    weaponModifier(weapon) {
        return 0;
    }

    /**
     * @param parameters All the action parameters.
     * @returns the attack modifier of the maneuver in use.
     */
    manoeuverModifier(parameters) {
        return AbstractCombatFeature.toInt(ManoeuverBuilder.create(parameters?.manoeuver, this)?.attack?.modifier);
    }

}