import { ActionDataBuilder } from "../../core/actionDataBuilder.js";
import { Constants } from "../../../module/common/constants.js";
import { Health } from "../../core/health.js";
import { ManoeuverPool } from "../manoeuver/manoeuverPool.js";
import { Melee } from "./melee.js";
import { Standard } from "../manoeuver/standard.js";

/**
 * Attaque gratuite déclenchée par une manœuvre de riposte (ex: Contrer) après une défense
 * réussie. C'est le dialogue d'attaque habituel, dont on retire tout ce qui en ferait une
 * action ordinaire du round :
 *   - la manœuvre est imposée et non modifiable : le pool n'en contient qu'une, Standard,
 *     et il est déclaré libre, donc non soumis aux règles de round ;
 *   - le jet est simple : aucun drapeau d'opposition n'est posé, donc aucune fenêtre de
 *     défense ne s'ouvre chez l'attaquant initial ;
 *   - rien n'est écrit dans la chronologie : l'attaque du round reste disponible.
 *
 * Réussie, elle inflige les dégâts à l'attaquant initial. Dans les deux cas, le résultat est
 * renvoyé à la manœuvre de riposte, seule à décider de ce que le défenseur subit.
 */
export class ContreAttaque extends Melee {

    /**
     * Constructor.
     * @param defense   L'action de défense à l'origine de la riposte.
     * @param manoeuver La manœuvre de défense qui riposte.
     */
    constructor(defense, manoeuver) {
        super(defense.actor, defense.weapon);
        this.defense = defense;
        this.riposte = manoeuver;
        this.target = defense.attack.actor.tokenOf;
        this.setManoeuver(Standard.ID);
    }

    /**
     * @Override
     */
    get title() {
        return "Contre-attaque";
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withItem(this.item)
            .withType(Constants.SIMPLE)
            .withBase(this.item?.name ?? game.i18n.localize("NEPHILIM.nonDefini"), this.degre)
            .withBlessures(Constants.PHYSICAL)
            .withManoeuvers(new ManoeuverPool().withManoeuver(Standard.ID).free())
            .withApproches(this.approches(Standard.ID))
            .withWeapon(this.weapon)
            .withTarget(this.target)
            .export();
    }

    /**
     * @Override
     */
    async finalize(result) {

        // Touché : l'attaquant initial encaisse, sans défense possible.
        if (result.success === true) {
            const impact = this.impact(this.manoeuver.id);
            await Health.applyDamagesOn(this.target?.id, impact, true, this.weapon, null, Constants.ACTION, this.manoeuver, result.critical);
            await Health.applyEffectsOn(this.target?.id, this.actor.id, Constants.ACTION, this.manoeuver);
        }

        // La manœuvre de riposte conclut : elle seule sait ce que le défenseur subit.
        await this.riposte.counterResolved(this.defense, result);

    }

}
