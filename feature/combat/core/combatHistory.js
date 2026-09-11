import { Constants } from "../../../module/common/constants.js";

/**
 * Chronologie du combat automatique : enregistre chaque manœuvre jouée par un combattant
 * (figure ou figurant) engagé dans un Combat, sous la forme d'une entrée plate
 * {round, actor, target, manoeuver, timestamp} stockée dans le flag world.combat du document
 * Combat lui-même.
 */
export class CombatHistory {

    /**
     * @param actor The actor to check.
     * @returns the actor's combatant in the combat currently underway, null if the actor
     *          isn't engaged in a combat.
     */
    static combatantOf(actor) {
        return actor?.combatant ?? null;
    }

    /**
     * Records a maneuver performed by an actor, if — and only if — that actor is currently
     * engaged in a combat. Silently does nothing otherwise: being tracked is a consequence of
     * being a combatant, not a precondition callers need to check themselves.
     * @param actor     The actor performing the maneuver.
     * @param manoeuver The identifier of the maneuver performed (e.g. Standard.ID, Viser.ID).
     * @param target    The optional actor targeted by the maneuver.
     */
    static async record(actor, manoeuver, target = null) {
        const combatant = CombatHistory.combatantOf(actor);
        if (combatant == null) return;
        const entry = {
            round: combatant.combat?.round ?? null,
            actor: actor.id,
            target: target?.id ?? null,
            manoeuver: manoeuver,
            timestamp: Date.now()
        };
        if (game.user.isGM === true) {
            await CombatHistory.#append(combatant.combat, entry);
        } else {
            game.socket.emit(Constants.SYSTEM_SOCKET_ID, {
                msg: Constants.MSG_RECORD_MANOEUVRE,
                data: { combat: combatant.combat.id, entry: entry }
            });
        }
    }

    /**
     * @param socketMessage The socket message received by a non-emitting client.
     */
    static async onSocketMessage(socketMessage) {
        if (game.user !== game.users.activeGM) return;
        const combat = game.combats.get(socketMessage.data.combat);
        if (combat != null) {
            await CombatHistory.#append(combat, socketMessage.data.entry);
        }
    }

    static async #append(combat, entry) {
        const history = combat.getFlag("world", "combat")?.history ?? [];
        await combat.setFlag("world", "combat", { history: [...history, entry] });
    }

    /**
     * @param combat The combat to read, defaults to the currently active one.
     * @returns the recorded maneuvers, oldest first.
     */
    static of(combat = game.combat) {
        return combat?.getFlag("world", "combat")?.history ?? [];
    }

}
