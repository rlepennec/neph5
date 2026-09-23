import { Constants } from "../../../module/common/constants.js";
import { Holds } from "./holds.js";

/**
 * Chronologie du combat automatique : enregistre chaque manœuvre jouée par un combattant
 * (figure ou figurant) engagé dans un Combat, sous la forme d'une entrée plate
 * {round, actor, target, manoeuver, family, noAttack, nextDefenseModifier, holds} stockée dans
 * le flag world.combat du document Combat lui-même. Le round de combat est la seule datation
 * qui compte ici : l'ordre d'ajout dans le tableau suffit à départager deux manœuvres du
 * même round.
 *
 * family/noAttack/nextDefenseModifier/holds sont recopiés depuis l'instance de manœuvre au moment
 * de l'enregistrement plutôt que reconstruits plus tard via ManoeuverBuilder : ce module est
 * importé par AbstractManoeuver (via l'historique des actions), et ManoeuverBuilder importe
 * toutes les manœuvres concrètes — les importer ici créerait un cycle.
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
     * @param manoeuver The maneuver instance performed (e.g. new Standard(), a Viser()
     *                  instance already in hand) — not just its identifier, so its
     *                  family/noAttack/nextDefenseModifier can be recorded alongside.
     * @param target    The optional actor targeted by the maneuver.
     */
    static async record(actor, manoeuver, target = null) {
        const combatant = CombatHistory.combatantOf(actor);
        if (combatant == null) return;

        // Tenir un adversaire occupe : jouer quoi que ce soit d'autre que Contrôler, c'est
        // lâcher sa prise, et celui qu'on retenait n'est alors plus immobilisé.
        if (manoeuver.maintainsHold !== true) {
            await Holds.release(CombatHistory.heldBy(actor));
        }

        const entry = {
            round: combatant.combat?.round ?? null,
            actor: actor.id,
            target: target?.id ?? null,
            manoeuver: manoeuver.id,
            family: manoeuver.family,
            noAttack: manoeuver.noAttack === true,
            nextDefenseModifier: manoeuver.nextDefenseModifier,
            holds: manoeuver.holds === true
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

    /**
     * @param actor The actor to check.
     * @returns l'acteur que celui-ci maintient immobilisé, null s'il ne tient personne.
     *
     * La prise n'est stockée nulle part : elle se lit dans la chronologie. C'est la dernière
     * manœuvre de prise jouée par l'acteur, à condition que personne n'ait repris la main sur
     * cette cible depuis — et que la cible soit effectivement immobilisée, ce qui écarte du
     * même coup les prises manquées, enregistrées comme les autres.
     */
    static heldBy(actor) {
        const combatant = CombatHistory.combatantOf(actor);
        if (combatant == null) return null;
        const history = [...CombatHistory.of(combatant.combat)].reverse();
        const prise = history.find(e => e.holds === true && e.actor === actor.id);
        if (prise?.target == null) return null;
        if (history.find(e => e.holds === true && e.target === prise.target).actor !== actor.id) return null;
        const held = combatant.combat.combatants.find(c => c.actor?.id === prise.target)?.actor;
        return held?.immobilise === true ? held : null;
    }

    /**
     * @param actor The acting combatant.
     * @returns the maneuvers already recorded for this actor during the current round of its
     *          combat, empty array if the actor isn't engaged in a combat.
     */
    static thisRound(actor) {
        const combatant = CombatHistory.combatantOf(actor);
        if (combatant == null) return [];
        const round = combatant.combat?.round;
        return CombatHistory.of(combatant.combat).filter(e => e.round === round && e.actor === actor.id);
    }

}
