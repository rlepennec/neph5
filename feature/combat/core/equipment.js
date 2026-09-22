import { Constants } from "../../../module/common/constants.js";

/**
 * L'équipement que les combattants ont en main. Le faire tomber porte sur l'acteur d'en face —
 * celui qu'on désarme — et demande donc les droits du MJ : comme pour les dégâts (Health), la
 * chronologie (CombatHistory) et les sorties de combat (Combatants), un joueur passe par le
 * socket système et c'est le MJ actif qui exécute.
 */
export class Equipment {

    /**
     * Fait tomber l'arme de la main de son porteur. Sans effet si elle n'y est plus.
     * @param weapon The weapon item to unequip.
     */
    static async disarm(weapon) {
        if (weapon?.system?.used !== true) return;
        if (game.user.isGM === true) {
            await Equipment.unequip(weapon);
        } else {
            game.socket.emit(Constants.SYSTEM_SOCKET_ID, {
                msg: Constants.MSG_DISARM,
                // L'uuid désigne l'arme où qu'elle soit embarquée, y compris sur l'acteur
                // synthétique d'un jeton non lié, que son seul identifiant ne suffirait pas
                // à retrouver depuis un autre client.
                data: { weapon: weapon.uuid }
            });
        }
    }

    /**
     * @param socketMessage The socket message received by a non-emitting client.
     */
    static async onSocketMessage(socketMessage) {
        if (game.user !== game.users.activeGM) return;
        await Equipment.unequip(await fromUuid(socketMessage.data.weapon));
    }

    /**
     * Repose l'arme, dans l'état où la repose le joueur lui-même : plus en main, et plus en
     * position de parade (voir le cycle d'équipement de CombatantMixin).
     * @param weapon The weapon item to unequip.
     */
    static async unequip(weapon) {
        if (weapon?.system?.used !== true) return;
        await weapon.update({
            ['system.used']: false,
            ['system.parade']: false
        });
    }

}
