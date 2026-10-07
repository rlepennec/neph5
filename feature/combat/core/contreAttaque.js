import { ActionDataBuilder } from "../../core/actionDataBuilder.js";
import { CombatDialog } from "./combatDialog.js";
import { Constants } from "../../../module/common/constants.js";
import { Health } from "../../core/health.js";
import { ManoeuverPool } from "../manoeuver/manoeuverPool.js";
import { Melee } from "./melee.js";
import { Riposte } from "./riposte.js";
import { Standard } from "../manoeuver/standard.js";

/**
 * Attaque gratuite d'une riposte en attente (voir Riposte), après une défense Contrer
 * réussie : le défenseur l'ouvre en attaquant avec une de ses armes de mêlée ou naturelles
 * en main. C'est le dialogue d'attaque habituel, dont on retire tout ce qui en ferait une
 * action ordinaire du round :
 *   - la manœuvre est imposée et non modifiable : le pool n'en contient qu'une, Standard,
 *     et il est déclaré libre, donc non soumis aux règles de round ;
 *   - le jet est simple : aucun drapeau d'opposition n'est posé, donc aucune fenêtre de
 *     défense ne s'ouvre chez l'attaquant initial ;
 *   - rien n'est écrit dans la chronologie : l'attaque du round reste disponible.
 *
 * Réussie, elle inflige les dégâts à l'attaquant initial. Dans les deux cas, la riposte est
 * ensuite conclue : elle décide de ce que le défenseur subit.
 */
export class ContreAttaque extends Melee {

    /**
     * Constructor.
     * @param actor   Le défenseur qui contre-attaque.
     * @param weapon  L'arme qu'il a choisie pour contre-attaquer.
     * @param riposte La riposte en attente (voir Riposte).
     */
    constructor(actor, weapon, riposte) {
        super(actor, weapon);
        this.riposte = riposte;
        this.target = canvas.tokens?.get(riposte.attaquant) ?? null;
        this.setManoeuver(Standard.ID);
    }

    /**
     * Ouvre le dialogue de la contre-attaque, sans passer par les règles de round de Melee.
     * @Override
     */
    async initializeRoll() {

        // Une arme de mêlée doit être en main ; une arme naturelle l'est toujours.
        if (this.weapon.system.type === Constants.MELEE && this.weapon.system.used !== true) {
            ui.notifications.info("L'arme n'est pas en main");
            return;
        }

        // L'attaquant initial doit encore être sur la scène.
        if (this.target == null) {
            ui.notifications.warn("L'adversaire à contre-attaquer n'est plus sur la scène.");
            return;
        }

        await new CombatDialog(this.actor, this)
            .withTitle(this.title)
            .withTemplate("systems/neph5e/feature/combat/core/contact.hbs")
            .withData(this.data)
            .render(true);

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
            await Health.applyDamagesOn(this.target?.id, impact, true, this.weapon, null, Constants.ACTION, this.manoeuver, result.critical, this.actor.id);
            await Health.applyEffectsOn(this.target?.id, this.actor.id, Constants.ACTION, this.manoeuver);
        }

        // La riposte conclut : rien pour le défenseur si elle a réussi, sinon l'attaque
        // initiale majorée de 2.
        await Riposte.conclure(this.actor, result.success === true);

    }

}
