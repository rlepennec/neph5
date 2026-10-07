import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";
import { Riposte } from "../core/riposte.js";

/**
 * Contrer : parade offensive à quitte ou double. Réussir à contrer demande DEUX jets —
 * le jet d'opposition habituel de la défense, PUIS un jet d'attaque standard.
 *   - jet d'opposition raté : les dégâts subis sont majorés de 2 ;
 *   - jet d'opposition réussi : le défenseur est prévenu qu'il peut contre-attaquer, et
 *     ses dommages restent suspendus (voir Riposte). Il contre-attaque en cliquant sur une
 *     de ses armes de mêlée ou naturelles en main : attaque standard imposée, jet simple
 *     (aucune défense possible en face), qui ne consomme pas l'action du round ;
 *       - ce second jet réussit : l'attaquant initial encaisse l'attaque standard, et le
 *         défenseur ne subit rien ;
 *       - ce second jet échoue, ou le défenseur n'a pas contre-attaqué avant le changement
 *         de round : les dégâts subis sont majorés de 2.
 */
export class Contrer extends AbstractManoeuver {

    static ID = "contrer";

    /** Absorption négative : Health.applyDamages majore les dégâts subis de 2. */
    static MAJORATION = { modifier: -2 };

    /**
     * Constructor.
     */
    constructor(action) {
        super(Contrer.ID,  Constants.PARADE, action);
        this.approches = ['feu','terre', 'ka'];
        this.nextDefenseModifier = -20;
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

        // Aucune arme de mêlée ou naturelle en main : il n'y a pas de quoi riposter, on s'en
        // tient à la parade.
        if (Riposte.armes(defense.actor).length === 0) {
            ui.notifications.warn(`${defense.actor.name} n'a aucune arme en main pour contre-attaquer.`);
            await super.resolveDefense(defense, winner);
            return;
        }

        // Jet d'opposition réussi : la riposte est mise en attente. Le défenseur contre-
        // attaque en choisissant une de ses armes ; la contre-attaque conclura alors.
        await Riposte.ouvrir(defense);

    }

}