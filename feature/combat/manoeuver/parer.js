import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";
import { Frapper } from "./frapper.js";

/**
 * Parer : intercepter l'attaque avec ce qu'on a en main. Une seule manœuvre couvre les trois
 * sortes d'attaques qu'on peut arrêter ainsi — le coup porté, l'arme lancée et le projectile
 * tiré —, chacune avec ses exigences, son absorption et sa description propres.
 */
export class Parer extends AbstractManoeuver {

    static ID = "parer";

    /** Parer un coup porté : l'arme en main suffit, et amortit 2 degrés. */
    static COUP = {
        approches: ['feu', 'terre', 'ka'],
        absorption: { modifier: 2 },
        description: "Description"
    };

    /** Parer une arme lancée : il faut de quoi bloquer, mais la prise amortit 3 degrés. */
    static LANCEE = {
        approches: ['terre', 'ka'],
        absorption: { modifier: 3 },
        description: "LanceDescription"
    };

    /** Parer un projectile : il faut de quoi bloquer, et l'objet n'amortit que 2 degrés. */
    static PROJECTILE = {
        approches: ['terre', 'ka'],
        absorption: { modifier: 2 },
        description: "ProjectileDescription"
    };

    /**
     * @param action L'action de défense, ou le pool, qui réagit à l'attaque.
     * @returns la parade qu'appelle l'attaque reçue — celle du coup porté par défaut, faute
     *          d'attaque connue.
     */
    static paradeOf(action) {
        switch (action?.attack?.manoeuver?.family) {
            case Constants.THROW:
                return Parer.LANCEE;
            case Constants.FIRE:
                return Parer.PROJECTILE;
            default:
                return Parer.COUP;
        }
    }

    /**
     * Constructor.
     * On ne pare pas un javelot comme on pare une épée : la manœuvre se règle sur l'attaque
     * qu'elle intercepte.
     */
    constructor(action) {
        super(Parer.ID, Constants.PARADE, action);
        this.parade = Parer.paradeOf(action);
        this.approches = this.parade.approches;
        this.absorption = this.parade.absorption;
        this.nextDefenseModifier = -20;
    }

    /**
     * @Override
     * Chaque parade a ses exigences et son efficacité : la manœuvre annonce celle qui
     * s'applique, pas les trois.
     */
    descriptionKey() {
        return AbstractManoeuver.clef(this.id, this.parade.description);
    }

    /**
     * @Override
     */
    defenseSentenceOf(winner) {
        return this.defenseSentence(winner);
    }

    /**
     * @Override
     * Chaque sorte d'attaque pose sa condition : une arme en main face à un coup porté, de
     * quoi bloquer face à une arme lancée, et face à un tir, un projectile — on ne pare pas
     * une balle.
     */
    canBePerformed(action) {
        if (this.exclusiveDefensePlayed(action)) return false;
        switch (action.attack.manoeuver.family) {
            case Constants.THROW:
                return this.blocage(action);
            case Constants.FIRE:
                return action.attack.weapon?.system?.type === Constants.TRAIT && this.blocage(action);
            default:
                return (action.weapon != null && action.attack.manoeuver.family === Constants.STRIKE) ||
                        action.attack.manoeuver.id === Frapper.ID;
        }
    }

    /**
     * @param action The action which perform the manoeuver to test.
     * @returns true si le défenseur oppose un bouclier — une arme marquée « blocages
     *          autorisés ». Une arme ordinaire n'arrête ni une arme lancée ni un projectile,
     *          et Defense.weapon() ne retient d'ailleurs qu'un bouclier face à ces attaques.
     */
    blocage(action) {
        return action.weapon != null && action.weapon.system.blocage === true;
    }

}
