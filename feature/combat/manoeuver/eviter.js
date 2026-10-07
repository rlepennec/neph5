import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

/**
 * Éviter : le réflexe de se dérober à un coup. Elle ne se joue pas aux dés — aucun jet, le
 * coup touche de toute façon — mais le défenseur en amortit toujours une part.
 *
 * C'est la seule défense du round : elle ne se joue que si aucune défense ne l'a été, une
 * seule fois donc, et plus aucune défense n'est proposée ensuite (seuleDefense).
 */
export class Eviter extends AbstractManoeuver {

    static ID = "eviter";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Eviter.ID, Constants.DODGE, action);
        this.automatic = true;
        this.approches = ['ka'];
        this.nextDefenseModifier = -20;
        this.absorption = {modifier: 1};
        this.seuleDefense = true;
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
        // La seule défense du round : pas si une autre défense a déjà été jouée.
        if (this.defensePlayed(action)) return false;
        // On n'évite qu'un coup : ni un tir, ni une empoignade (Immobiliser, Projeter...).
        return action.attack.manoeuver.strike === true &&
               action.actor.isEsquiveAvailable;
    }

}