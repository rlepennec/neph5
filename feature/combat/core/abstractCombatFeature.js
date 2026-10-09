import { AbstractFeature } from "../../core/abstractFeature.js";
import { CombatHistory } from "./combatHistory.js";
import { Excedent } from "./excedent.js";
import { ManoeuverBuilder } from "../manoeuver/manoeuverBuilder.js";

export class AbstractCombatFeature extends AbstractFeature {

    /**
     * @returns the maneuvers already played this round by the acting actor, empty array if
     *          the actor isn't engaged in a combat.
     */
    get history() {
        return CombatHistory.thisRound(this.actor);
    }

    difficulty(parameters) {

        const data = this.data;

        // Le malus de blessure réduit d'abord la Compétence (ou la Menace) utilisée, jusqu'à 0 ;
        // l'approche et les autres modificateurs s'ajoutent ensuite (voir baseBlessee).
        return AbstractFeature.baseBlessee(AbstractCombatFeature.toInt(data?.base?.difficulty), AbstractFeature.toInt(parameters?.blessures, data.blessures))
            + AbstractFeature.toInt(parameters?.modifier)
            + AbstractFeature.toInt(parameters?.approche)
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
     * Attaque opposée sur une cible avec une marge supérieure à 10 : l'attaquant répartit
     * ses degrés au-delà de 10 entre dommages et malus de défense adverse, avant que le
     * message ne propose la défense. Sa répartition voyage dans le résultat de l'attaque
     * (result.excedent), que la défense reçoit (voir Defense).
     * @Override
     */
    async apply(result) {
        if (result?.opposed === true && this.purpose?.type === 'combat' && this.purpose?.target != null) {
            const points = Excedent.points(result);
            if (points > 0) {
                result.excedent = await Excedent.repartir(this.actor, points, Excedent.ATTAQUE);
            }
        }
        await super.apply(result);
    }

    /**
     * En combat, le chat ne donne ni degré ni chiffre : la marge n'est pas annoncée.
     * @Override
     */
    marginSentence(margin) {
        return "";
    }

    /**
     * Les blessures infligées sont annoncées une fois les dommages appliqués (voir Health) :
     * l'impact n'est affiché que si le MJ applique lui-même les dégâts de la cible, ou sans
     * cible.
     * @Override
     */
    displayedImpact() {
        const cible = this.target?.actor;
        return cible?.system?.options?.degatAutomatique === true ? null : this.impact();
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