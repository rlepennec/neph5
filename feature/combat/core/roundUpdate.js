import { ActiveEffects } from "../../core/effects.js";
import { CombatHistory } from "./combatHistory.js";
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

    // Riposte (Contrer réussi) encore en attente : le défenseur n'a pas contre-attaqué
    // pendant le round, il subit l'attaque initiale majorée de 2. Un seul MJ l'applique.
    async (actor, combat) => {
        if (game.user !== game.users.activeGM) return;
        if (Riposte.of(actor) == null) return;
        await Riposte.conclure(actor, false);
    }

];

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
