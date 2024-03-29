import { Attack } from "../combat/core/attack.js";
import { Constants } from "../../module/common/constants.js";
import { Defense } from "../combat/core/defense.js";
import { Distance } from "../combat/core/distance.js";
import { ManoeuverBuilder } from "../combat/manoeuver/manoeuverBuilder.js";
import { Melee } from "../combat/core/melee.js";
import { Naturelle } from "../combat/core/naturelle.js";
import { Pacte } from "../kabbale/pacte.js";
import { ReactionRoll } from "./reactionRoll.js";
import { Wrestle } from "../combat/core/wrestle.js";

export class OpposedRollBuilder {

    /**
     * Create the specified reaction roll.
     * @param data The chat message data.
     */
    static async create(data) {

        // Hook messages with the system identifier flags used to solve opposed actions.
        const flags = data?.message?.flags[game.system.id];
        if (flags == null || !flags.hasOwnProperty(Constants.OPPOSED)) {
            return;
        }

        // Retrieve the actor which performed the initial action.
        const actor = OpposedRollBuilder.actorFromFlag(flags);
        if (actor == null) {
            return;
        }

        // Handle the initial action according to his type.
        switch (flags.opposed.purpose.type) {

            case 'combat':
                if (Distance.manoeuvers().ids.includes(flags.opposed.purpose?.manoeuver) ||
                    Melee.manoeuvers().ids.includes(flags.opposed.purpose?.manoeuver) || 
                    Naturelle.manoeuvers().ids.includes(flags.opposed.purpose?.manoeuver) ||
                    Wrestle.manoeuvers().ids.includes(flags.opposed.purpose?.manoeuver)) {

                    // Attack without target are processed as general reaction by GM.
                    if (flags.opposed.purpose.target == null) {
                        if (game.user.isGM) {
                            return new ReactionRoll(
                                actor,
                                flags.opposed.purpose,
                                flags.opposed.result);
                        }

                    // Attack with target are processed as defense reaction by the player if connected or the GM otherwise.
                    } else {
                        const token = OpposedRollBuilder.tokenFromId(flags.opposed.purpose.target);
                        if (OpposedRollBuilder.handle(token)) {
                            const attacker = OpposedRollBuilder.actorFromId(flags.opposed.purpose.attacker);
                            const manoeuver = ManoeuverBuilder.create(flags.opposed.purpose.manoeuver);
                            const attack = new Attack(
                                attacker,
                                flags.opposed.purpose.impact,
                                manoeuver,
                                actor.items.get(flags.opposed.purpose.weapon));
                            const defense = new Defense(
                                token.actor,
                                attack,
                                flags.opposed.result)
                            return await defense.defenseToPerform();
                        }
                    }

                }
                break;

            case 'invocation':
                if (game.user.isGM) {
                    return new Pacte(
                        actor,
                        flags.opposed.purpose,
                        flags.opposed.result);
                }
                break;

            default:
                if (game.user.isGM) {
                    return new ReactionRoll(
                        actor,
                        flags.opposed.purpose,
                        flags.opposed.result);
                }
                break;

        }

    }

    /**
     * Only used for combat to handle attack manoeuver.
     * @param token The targeted token object.
     * @return true if the current player must handle the action.
     */
    static handle(token) {

        // Invalid token.
        if (token == null || token.actor == null) {
            return false;
        }

        // The current player is the owner of the target and the defense of the figure token is managed by the PJ.
        if (!game.user.isGM && token.isOwner && token.actor.system?.options?.defenseMJ !== true) {
            return true;
        }

        // The current player is not the owner of the target and not the GM.
        if (!game.user.isGM) {
            return false;
        }

        // The target is not managed by a player, just by the GM.
        if (!token.actor.hasPlayerOwner) {
            return true;
        }

        // The target is managed by a player which is connected. 
        for (const [userId, perm] of Object.entries(token.actor.ownership)) {
            if (perm === 3) {
                const user = game.users.get(userId);
                if (user != null) {
                    if (!user.isGM && user.active && token.actor.system?.options?.defenseMJ !== true) {
                        return false;
                    }
                }
            }
        }

        // The target is managed by a player which is not connected.
        return true;

    }

    /**
     * @param flags The foundry identifier of the actor defined in the flag.
     * @returns the actor which performs the initial action.
     */
    static actorFromFlag(flags) {

        // Initialization
        const id = flags.opposed.actor;
        let actor = null;

        // Retrieve the actor from scene.
        actor = game.canvas?.scene?.tokens.find(t => t.actorId === id)?.actor;
        if (actor != null) {
            return actor;
        }

        // Retrieve the actor from game.
        actor = game.actors.find(a => a.id === id);
        if (actor != null) {
            return actor;
        }

        // Error
        ui.notifications.error("Acteur " + id + " introuvable");

    }

    /**
     * @param id The idenfier of the token.
     * @return the token.
     */
    static tokenFromId(id) {
        return canvas.tokens?.objects?.children.find(t => t.id === id);
    }

    /**
     * @param id The idenfier of the actor.
     * @return the actor.
     */
    static actorFromId(id) {
        return canvas.tokens?.objects?.children.find(t => t.actor.id === id)?.actor;
    }

}