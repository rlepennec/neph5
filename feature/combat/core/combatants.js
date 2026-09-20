import { Constants } from "../../../module/common/constants.js";

/**
 * Entrées et sorties du combat en cours. Supprimer un combattant demande les droits du MJ :
 * comme pour les dégâts (Health) et la chronologie (CombatHistory), un joueur passe par le
 * socket système et c'est le MJ actif qui exécute.
 */
export class Combatants {

    /**
     * Retire du combat en cours le combattant de l'acteur (manœuvre de sortie, ex: Fuir).
     * Sans effet s'il n'y est pas engagé.
     * @param actor The actor leaving the fight.
     */
    static async leave(actor) {
        const combatant = actor?.combatant;
        if (combatant == null) return;
        if (game.user.isGM === true) {
            await combatant.delete();
        } else {
            game.socket.emit(Constants.SYSTEM_SOCKET_ID, {
                msg: Constants.MSG_LEAVE_COMBAT,
                data: { combat: combatant.combat.id, combatant: combatant.id }
            });
        }
    }

    /**
     * @param socketMessage The socket message received by a non-emitting client.
     */
    static async onSocketMessage(socketMessage) {
        if (game.user !== game.users.activeGM) return;
        const combatant = game.combats.get(socketMessage.data.combat)?.combatants.get(socketMessage.data.combatant);
        if (combatant != null) {
            await combatant.delete();
        }
    }

}
