import { ActiveEffects } from "../../core/effects.js";
import { CombatHistory } from "./combatHistory.js";
import { Constants } from "../../../module/common/constants.js";
import { Health } from "../../core/health.js";
import { Etrange } from "../manoeuver/etrange.js";
import { Riposte } from "./riposte.js";

/**
 * Mises à jour élémentaires appliquées à chaque combattant au début d'un round. Chaque
 * entrée est une fonction (actor, combat) qui applique — ou non — sa propre règle. Pour en
 * ajouter une (autre effet, autre source de désorientation...) : ajouter une fonction ici.
 */
const UPDATES = [

    // Désorientation causée par une attaque étrange : levée si aucune attaque étrange n'a
    // touché l'acteur au cours des deux derniers rounds (celui où elle a été infligée et
    // le round de grâce qui suit) — une attaque étrange plus récente prolonge l'effet.
    async (actor, combat) => {
        if (!ActiveEffects.isActive(actor, ActiveEffects.DESORIENTE)) return;
        const lastHit = CombatHistory.of(combat)
            .filter(e => e.target === actor.id && e.manoeuver === Etrange.ID)
            .reduce((max, e) => Math.max(max, e.round ?? -Infinity), -Infinity);
        if (combat.round - lastHit >= 2) {
            await ActiveEffects.deactivate(actor, ActiveEffects.DESORIENTE);
        }
    },

    // Prise maintenue : celui qui tient peut infliger 1 dommage à celui qu'il immobilise, à
    // chaque fin de round, s'il le veut. La question ne bloque pas les autres mises à jour.
    async (actor, combat) => {
        if (game.user !== game.users.activeGM) return;
        const held = CombatHistory.heldBy(actor);
        if (held == null) return;
        proposerDommageDePrise(actor, held).catch(e => console.error(e));
    },

    // Riposte (Contrer réussi) encore en attente : le défenseur n'a pas contre-attaqué
    // pendant le round, il subit l'attaque initiale majorée de 2. Un seul MJ l'applique.
    async (actor, combat) => {
        if (game.user !== game.users.activeGM) return;
        if (Riposte.of(actor) == null) return;
        await Riposte.conclure(actor, false);
    }

];

/**
 * Demande à celui qui tient la prise s'il inflige 1 dommage à celui qu'il immobilise : à son
 * joueur s'il est connecté, au MJ sinon. Accepté, c'est 1 dommage fixe, armure ignorée, comme
 * celui de la prise (Immobiliser).
 * @param holder L'acteur qui tient la prise.
 * @param held   L'acteur immobilisé.
 */
async function proposerDommageDePrise(holder, held) {
    const user = game.users.find(u => u.active && !u.isGM && holder.testUserPermission(u, "OWNER"))
        ?? game.users.activeGM;
    const accord = await foundry.applications.api.DialogV2.query(user, "confirm", {
        window: { title: "Immobilisation" },
        content: "<p>" + holder.name + " maintient " + held.name + " immobilisé. Lui infliger 1 dommage ?</p>",
        rejectClose: false
    });
    if (accord !== true) return;
    // La prise a pu être lâchée pendant que la question attendait.
    if (CombatHistory.heldBy(holder)?.id !== held.id) return;
    await Health.applyDamagesOn(held.tokenOf?.id, 0, true, null, null, Constants.ACTION, { impact: { fix: 1 } }, false, holder.id);
}

export class RoundUpdate {

    /**
     * Applique toutes les mises à jour élémentaires à chaque combattant du combat.
     * @param combat Le combat qui vient d'avancer d'un round.
     */
    static async apply(combat) {
        for (const combatant of combat.combatants) {
            const actor = combatant.actor;
            if (actor == null) continue;
            for (const update of UPDATES) {
                await update(actor, combat);
            }
        }
    }

}
