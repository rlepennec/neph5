import { AbstractFeature } from "../../core/abstractFeature.js";

export class AbstractCombatFeature extends AbstractFeature {

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

}