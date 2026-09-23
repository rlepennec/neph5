import { ActiveEffects } from "../../core/effects.js";
import { Constants } from "../../../module/common/constants.js";

/**
 * Les prises : maintenir un adversaire immobilisé occupe celui qui le tient. Il garde sa prise
 * tant qu'il ne joue rien d'autre que Contrôler ; dès qu'il attaque ou se défend d'un autre
 * adversaire, il la lâche et son prisonnier se retrouve libre (voir CombatHistory.heldBy, qui
 * dit qui tient qui).
 *
 * Lever l'immobilisation porte sur l'acteur d'en face : comme pour les dégâts (Health), la
 * chronologie (CombatHistory) ou le désarmement (Equipment), un joueur passe par le socket
 * système et c'est le MJ actif qui exécute.
 */
export class Holds {

    /**
     * Libère l'acteur de la prise qui le retenait. Sans effet s'il n'est pas immobilisé.
     * @param actor The held actor, null if none.
     */
    static async release(actor) {
        if (actor?.immobilise !== true) return;
        if (game.user.isGM === true) {
            await Holds.free(actor);
        } else {
            game.socket.emit(Constants.SYSTEM_SOCKET_ID, {
                msg: Constants.MSG_RELEASE_HOLD,
                // L'uuid désigne l'acteur où qu'il soit, y compris l'acteur synthétique d'un
                // jeton non lié, que son seul identifiant ne suffirait pas à retrouver depuis
                // un autre client.
                data: { actor: actor.uuid }
            });
        }
    }

    /**
     * @param socketMessage The socket message received by a non-emitting client.
     */
    static async onSocketMessage(socketMessage) {
        if (game.user !== game.users.activeGM) return;
        await Holds.free(await fromUuid(socketMessage.data.actor));
    }

    /**
     * @param actor The held actor.
     */
    static async free(actor) {
        if (actor?.immobilise !== true) return;
        await actor.deactivateEffect(ActiveEffects.IMMOBILISE.name);
    }

}
