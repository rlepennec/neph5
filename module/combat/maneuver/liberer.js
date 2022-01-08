import { Game } from "../../common/game.js";
import { Maneuver } from "./maneuver.js";
import { NephilimChat } from "../../common/chat.js";

export class Liberer extends Maneuver {

    /**
     * The identifier of the action.
     */
    static id = 'liberer';

    /**
     * The tooltip of the action.
     */
    static tooltip = "Supprime l'effet immobilisé";

    /**
     * Indicates others actions can't be performed.
     */
    static exclusive = true;

    /**
     * Indicates the number of this action which can be performed.
     */
    static occurence = 1;

    /**
     * The effects produced by the action.
     */
    static effects = [];

    /**
     * @Override
     */
    sentence() {
        return "se libère";
    }

    /**
     * @Override
     */
    difficulty() {
        return this.token.actor.getSkill('martial');
    }

    /**
     * @Override
     */
    impact() {
        return undefined;
    }

    /**
     * @Override
     * 
     * To be allowed a liberer action must validate the following assertions:
     *  - The history of the round allows this action
     *  - The token is immobilized
     */
    allowed() {

        return this.token.combatant.getAllowedActionFromHistory(this) && this.immobilized();

    }

    /**
     * @Override
     */
    async doit(action) {

        // Displays the action description as chat message
        await new NephilimChat(this.actor)
            .withTemplate("systems/neph5e/templates/dialog/combat/combat-action.hbs")
            .withData({
                actor: this.actor,
                action: action
            })
            .create();

        // Rolls dices
        await this.updateRoll(action);

        // Compare the opponent roll with current one
        let success = action.roll.success;
        if (success) {
            const roll = this.token.combatant.getEffectRoll(Game.effects.immobilise);
            if (roll != undefined) {
                success = this.versus(action.roll, roll) >= 0;
            }
        }

        // Deactivate the effect or suffer 1 damage
        if (success) {
            await this.token.combatant.deactivateEffect(Game.effects.immobilise);
        } else {
            await this.suffer();
        }

        return;

    }

    /**
     * Suffers 1 damage
     */
    async suffer(action) {

        // Apply the effects
        const effects = [];
        effects.push(this.actor.data.name + Game.effects.immobilise.sentence);

        // Apply the damages
        let wound = await this.token.combatant.applyDamages(1, 'physique');

        // Display the result
        await new NephilimChat(this.actor)
            .withTemplate("systems/neph5e/templates/dialog/combat/combat-result.hbs")
            .withData({
                actor: this.actor,
                action: {
                    type: 'defense',
                    sentence: "subit l'immobilisation"
                },
                result: {
                    protection: 0,
                    reduction: 0,
                    impact: 1,
                    damages: 1,
                    wound: wound === null ? "ne reçoit aucune blessure" : ("reçoit " + wound.sentence),
                    effects: effects
                }
            })
            .create();

        return this;

    }

}