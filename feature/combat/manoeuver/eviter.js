import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

/**
 * Éviter : le réflexe de se dérober à un coup. Elle ne se joue pas aux dés — aucun jet, le
 * coup touche de toute façon — mais le défenseur en amortit toujours une part.
 */
export class Eviter extends AbstractManoeuver {

    static ID = "eviter";

    /**
     * Constructor.
     */
    constructor() {
        super(Eviter.ID, Constants.DODGE);
        this.withAutomatic();
        this.withApproches(['ka']);
        this.withNextDefenseModifier(-20);
        this.withAbsorption({modifier: 1});
    }

    /**
     * @Override
     * Le coup touche (l'attaquant l'emporte, faute de jet en défense), mais l'absorption
     * s'applique tout de même : c'est tout l'effet d'Éviter.
     */
    async resolveDefense(defense, winner) {
        await defense.applyDamages(this.absorption);
    }

    /**
     * @Override
     * Le coup touche toujours (voir resolveDefense) : la phrase générique dirait juste que
     * le défenseur échoue, sans mentionner que l'absorption réduit quand même les dommages.
     */
    defenseSentenceOf(winner) {
        return " subit l'attaque mais évite une partie des dommages";
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        if (this.exclusiveDefensePlayed(action)) return false;
        // On n'évite qu'un coup : ni un tir, ni une empoignade (Immobiliser, Projeter...).
        return action.attack.manoeuver.strike === true &&
               action.actor.isEsquiveAvailable;
    }

}