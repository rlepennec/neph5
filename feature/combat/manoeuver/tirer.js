import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Tirer extends AbstractManoeuver {

    static ID = "tirer";

    /**
     * Constructor.
     * Sans visée en cours sur la cible, un tir peut être instinctif (approche de feu) ou posé
     * (approche d'air) : c'est tout ce qui les distinguait, Instinctif n'est donc plus une
     * manœuvre à part. Dès que la cible est visée (état tenu par Viser sur l'arme), seul le
     * tir posé a du sens. 'ka' reste l'approche des figurants dans les deux cas.
     */
    constructor(action) {
        super(Tirer.ID, Constants.FIRE, action);
        const vise = action?.target != null && action.weapon?.system.cible === action.target.id;
        this.approches = vise ? ['air', 'ka'] : ['feu', 'air', 'ka'];
        this.impact = {modifier: 0};
    }

    /**
     * @Override
     */
    isAllowed(action) {
        return action.weapon.system.type === 'trait' ||
              (action.weapon.system.munitions > action.weapon.system.tire);
    }

    /**
     * @Override
     */
    async apply(action) {
        await action.weapon.update({ ['system.tire']: action.weapon.system.tire + 1 });
    }

}