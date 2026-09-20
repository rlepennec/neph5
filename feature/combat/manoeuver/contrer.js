import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

/**
 * Contrer : parade offensive à quitte ou double. Réussir à contrer demande DEUX jets —
 * le jet d'opposition habituel de la défense, PUIS un jet d'attaque standard.
 *   - jet d'opposition raté : les dégâts subis sont majorés de 2 ;
 *   - jet d'opposition réussi : une attaque standard gratuite s'ouvre automatiquement —
 *     manœuvre imposée, jet simple (aucune défense possible en face), et elle ne consomme
 *     pas l'action du round ;
 *       - ce second jet réussit : l'attaquant initial encaisse l'attaque standard, et le
 *         défenseur ne subit rien ;
 *       - ce second jet échoue : les dégâts subis sont majorés de 2.
 */
export class Contrer extends AbstractManoeuver {

    static ID = "contrer";

    /** Absorption négative : Health.applyDamages majore les dégâts subis de 2. */
    static MAJORATION = { modifier: -2 };

    /** Absorption fixe : Health.applyDamages sort aussitôt, aucun dégât n'est subi. */
    static AUCUN_DEGAT = { fix: 0 };

    /**
     * Constructor.
     */
    constructor() {
        super(Contrer.ID,  Constants.PARADE);
        this.withApproches(['feu','terre', 'ka']);
        this.withNextDefenseModifier(-20);
    }

    /**
     * @Override
     */
    defenseSentenceOf(winner) {
        return this.defenseSentence(winner);
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        if (this.exclusiveDefensePlayed(action)) return false;
        return action.attack.manoeuver.family === Constants.STRIKE ||
              (action.attack.manoeuver.family === Constants.BRAWL && action.weapon != null);
    }

    /**
     * @Override
     */
    async resolveDefense(defense, winner) {

        // Jet d'opposition raté : le coup passe, et il fait plus mal.
        if (winner === Constants.ACTION) {
            await defense.applyDamages(Contrer.MAJORATION);
            return;
        }

        // Rien en main : il n'y a pas de quoi riposter, on s'en tient à la parade.
        if (defense.counterWeapon == null) {
            ui.notifications.warn(`${defense.actor.name} n'a aucune arme en main pour contre-attaquer.`);
            await super.resolveDefense(defense, winner);
            return;
        }

        // Jet d'opposition réussi : la contre-attaque s'ouvre et conclura via
        // counterResolved() une fois son propre jet effectué.
        await defense.counterAttack(this);

    }

    /**
     * Suite de resolveDefense : rappelée par la contre-attaque une fois son jet résolu.
     * @param defense L'action de défense à l'origine de la riposte.
     * @param result  Le résultat du jet de contre-attaque.
     */
    async counterResolved(defense, result) {
        await defense.applyDamages(result.success === true ? Contrer.AUCUN_DEGAT : Contrer.MAJORATION);
    }

}