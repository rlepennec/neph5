import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";
import { Equipment } from "../core/equipment.js";

export class Desarmer extends AbstractManoeuver {

    static ID = "desarmer";

    /** Absorption négative : Health.applyDamages majore de 2 les dégâts subis. */
    static MAJORATION = { modifier: -2 };

    /**
     * Constructor.
     * Désarmer à mains nues celui qui tient une arme de mêlée est autrement plus ardu.
     */
    constructor(action) {
        super(Desarmer.ID, Constants.PARADE, action);
        this.approches = ['lune', 'ka'];
        this.nextDefenseModifier = -20;
        this.defense = {
            modifier: action?.attack?.weapon?.system?.type === Constants.MELEE && action.weapon == null ? -80 : -40
        };
        // Absorption fixe : Health.applyDamages sort aussitôt, la parade réussie annule tout.
        this.absorption = { fix: 0 };
    }

    /**
     * @Override
     * Désarmer est à quitte ou double. Parade ratée, les dommages subis par le défenseur sont
     * majorés de 2. Parade réussie, l'attaque est entièrement détournée — le défenseur
     * n'encaisse rien, voir l'absorption fixe du constructeur — et l'arme quitte la main de
     * l'attaquant, qui n'encaisse rien non plus : le geste écarte l'arme, il ne frappe pas.
     */
    async resolveDefense(defense, winner) {
        if (winner === Constants.ACTION) {
            await defense.applyDamages(Desarmer.MAJORATION);
            return;
        }
        await super.resolveDefense(defense, winner);
        await Equipment.disarm(defense.attack.weapon);
    }

    /**
     * @Override
     */
    defenseSentenceOf(winner) {
        return this.defenseSentence(winner);
    }

    /**
     * @Override
     * On ne désarme que ce qui se tient en main : une attaque naturelle — poing, crocs,
     * griffes — ne laisse rien à faire tomber.
     */
    canBePerformed(action) {
        if (this.exclusiveDefensePlayed(action)) return false;
        return action.attack.manoeuver.family === Constants.STRIKE &&
               action.attack.weapon?.system?.type === Constants.MELEE;
    }

}