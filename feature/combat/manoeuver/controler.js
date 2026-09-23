import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

/**
 * Contrôler : resserrer sa prise sur qui tente de s'en défaire. C'est la seule réponse à
 * Libérer, et elle ne répond qu'à elle.
 *
 * Réussie, elle n'a rien à appliquer : l'immobilisation ne se lève que lorsque Libérer
 * l'emporte (voir Health.applyEffectsOn). Maintenir la prise, c'est simplement gagner
 * l'opposition.
 */
export class Controler extends AbstractManoeuver {

    static ID = "controler";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Controler.ID, Constants.PARADE, action);
        this.approches = ['eau', 'feu', 'ka'];
        this.nextDefenseModifier = -20;
        this.maintainsHold = true;
    }

    /**
     * @Override
     * Contrôler se joue en lutte, comme la prise qu'elle maintient : ni esquive, ni arme. Sa
     * famille la range parmi les réactions — une défense ne consomme pas l'action du round —
     * mais sa base est celle de la lutte.
     */
    competenceField() {
        return 'lutte';
    }

    /**
     * @Override
     */
    defenseSentenceOf(winner) {
        return this.defenseSentence(winner);
    }

    /**
     * @Override
     * L'attaque désigne elle-même sa seule réponse possible : Contrôler ne se propose que là
     * où on la réclame, et le pool écarte alors toutes les autres défenses (voir
     * AbstractManoeuver.onlyDefense et ManoeuverPool.all).
     */
    canBePerformed(action) {
        if (this.exclusiveDefensePlayed(action)) return false;
        return action.attack.manoeuver.onlyDefense === this.id &&
               action.actor.isLutteAvailable;
    }

}
