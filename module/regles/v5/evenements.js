import { CombatHistory } from "../../../feature/combat/regles/v5/core/combatHistory.js";
import { Combatants } from "../../../feature/combat/regles/v5/core/combatants.js";
import { Constants } from "../../common/regles/v5/constants.js";
import { Equipment } from "../../../feature/combat/regles/v5/core/equipment.js";
import { Health } from "../../../feature/core/regles/v5/health.js";
import { Holds } from "../../../feature/combat/regles/v5/core/holds.js";
import { MacrosV5 } from "../../common/regles/v5/macros.js";
import { NephilimChat } from "../../common/regles/v5/chat.js";
import { OpposedRollBuilder } from "../../../feature/core/regles/v5/opposedRollBuilder.js";
import { RoundUpdate } from "../../../feature/combat/regles/v5/core/roundUpdate.js";

/**
 * Les réactions des règles v5 aux événements de Foundry (voir Regles). Les hooks sont déclarés une
 * seule fois par neph5e.js, qui les transmet au jeu de la version courante à chaque appel.
 */
export const EvenementsV5 = {

    /**
     * Le combat automatique ne concerne que les figures et les figurants.
     * @param combatant The combatant about to be created.
     * @returns false to cancel its creation.
     */
    combattantCree(combatant) {
        if (combatant.actor?.type === 'fraternite') {
            ui.notifications.warn("Une fraternité ne peut pas participer à un combat.");
            return false;
        }
    },

    /**
     * Mise à jour de tous les combattants au début de chaque round (ex: désorientation qui
     * s'estompe faute d'être ré-infligée). Un seul client l'exécute.
     * @param combat The combat.
     */
    async nouveauRound(combat) {
        if (!game.user.isGM) return;
        await RoundUpdate.apply(combat);
    },

    /**
     * Handle chat message for opposed rolls, especially combat system.
     *
     * Foundry rend un même message de chat plusieurs fois. Ce handler étant asynchrone, Foundry ne
     * l'attend pas : quatre rendus rapprochés entraient tous dans create() avant que le premier
     * n'ait retiré le drapeau, et ouvraient quatre fenêtres de défense superposées. claim() pose un
     * verrou SYNCHRONE, avant le premier await ; release() le rend si aucune réaction n'a
     * finalement été ouverte.
     * @param message The chat message.
     */
    async messageAffiche(message) {
        if (!OpposedRollBuilder.claim(message)) return;
        const reaction = await OpposedRollBuilder.create(message);
        if (reaction == null) {
            OpposedRollBuilder.release(message);
            return;
        }
        await reaction.initializeRoll();
        await NephilimChat.unsetFlags(message.id);
    },

    /**
     * Un jet glissé d'une fiche dans la barre de macros. Doit rester SYNCHRONE : la réponse sert au
     * hook hotbarDrop à annuler le traitement par défaut de Foundry.
     * @returns true if the drop is handled.
     */
    macroDeposee(bar, data, slot) {
        if (!MacrosV5.handles(data)) return false;
        MacrosV5.create(data, slot);
        return true;
    },

    /**
     * Les messages échangés entre clients par les règles v5.
     * @param socketMessage The socket message.
     */
    async messageRecu(socketMessage) {
        switch (socketMessage.msg) {
            case Constants.MSG_UNSET_CHAT_MESSAGE:
                await NephilimChat.onSocketMessage(socketMessage);
                break;
            case Constants.MSG_APPLY_DAMAGES_ON:
                await Health.onSocketMessage(socketMessage);
                break;
            case Constants.MSG_APPLY_EFFECTS_ON:
                await Health.onSocketMessage(socketMessage);
                break;
            case Constants.MSG_RECORD_MANOEUVRE:
                await CombatHistory.onSocketMessage(socketMessage);
                break;
            case Constants.MSG_LEAVE_COMBAT:
                await Combatants.onSocketMessage(socketMessage);
                break;
            case Constants.MSG_DISARM:
                await Equipment.onSocketMessage(socketMessage);
                break;
            case Constants.MSG_RELEASE_HOLD:
                await Holds.onSocketMessage(socketMessage);
                break;
        }
    }
};
