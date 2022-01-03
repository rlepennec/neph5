import { Game } from "../common/game.js";
import { Rolls } from "../common/rolls.js";

/**
 * This abstract class must be used to define token action.
 */
export class Action {

    /**
     * The definition of the action types.
     */
    static Types = {
        maneuver: {
            id: 'maneuver'
        },
        ranged: {
            id: 'ranged'
        },
        unarmed: {
            id: 'unarmed'
        },
        melee: {
            id: 'melee'
        },
        defense: {
            id: 'defense'
        }
    }

    /**
     * Constructor.
     * @param actor  The actor which performs the action.
     * @param token  The token for which performs the action.
     * @param weapon The weapon object used to perform the action.
     * @param target The optional target token.
     */
    constructor(actor, token, weapon, target) {
        if (this.constructor === Action) {
            throw new TypeError('Abstract class "Action" cannot be instantiated directly');
        }
        this.actor = actor;
        this.token = token;
        this.weapon = weapon;
        this.target = target === undefined ? this.createTarget() : target;
    }

    /**
     * @returns the current target. 
     */
    createTarget() {
        const target = this.getTarget();
        return target != undefined ? {
            id: target.id,
            name: target.name,
            img: target.data.img,
            flags: target.combatant.data.flags,
            dodge: target.actor.getSkill('esquive'),
            token: target
        } : undefined
    }

    /**
     * @returns the data used to create the allowed action list. The data must be completed by
     * adding the method getData which adds the identifier and the type of the action.
     */
    data() {

        const targetData = this.constructor.targeted ? {
            id: this.target.id,
            name: this.target.name,
            img: this.target.img,
            targetedWeapon: this.target.targetedWeapon
        } : undefined;

        return {
            id: this.constructor.id,
            name: this.constructor.name,
            type: this.constructor.type,
            sentence: this.sentence(),
            tooltip: this.constructor.tooltip,
            exclusive: this.constructor.exclusive,
            occurence: this.constructor.occurence,
            effects: this.constructor.effects,
            difficulty: this.difficulty(),
            defense: this.constructor.defense,
            impact: this.impact(),
            actor: {
                id: this.actor.id,
                tokenId: this.token.id,
                name: this.actor.name,
                img: this.actor.img,
                flags: this.token.combatant.data.flags,
                dodge: this.actor.getSkill('esquive'),
                weapon: this.weapon
            },
            target : targetData
        }
    }

    /**
     * @parap target The optional target of the action.
     * @returns true if the specified effect is active on the optional target.
     */
    effectIsActiveOnTarget(effect) {
        return this.target != undefined && this.target.token.combatant.effectIsActive(effect)
    }

    /**
     * @returns true if the specified effect is active on the optional target.
     */
    effectIsActive(effect) {
        return this.token.combatant.effectIsActive(effect);
    }

    /**
     * @returns true if the token is disoriented.
     */
    disoriented() {
        return this.effectIsActive(Game.effects.desoriente);
    }

    /**
     * @returns true if the token is on the ground.
     */
    grounded() {
        return this.effectIsActive(Game.effects.projete);
    }

    /**
     * @returns true if the token is immobilized.
     */
    immobilized() {
        return this.effectIsActive(Game.effects.immobilise);
    }

    /**
     * @returns true if the token is hidden.
     */
    hidden() {
        return this.effectIsActive(Game.effects.cache);
    }

    /**
     * @returns true if the token is covered.
     */
    covered() {
        return this.effectIsActive(Game.effects.couvert);
    }

    /**
     * @returns true if the action is allowed.
     */
    allowed() {
        throw new Error("Abstract method 'allowed' must be implemeted");
    }

    /**
     * Performs the specified action.
     * @param action The data of the action to perform.
     */
    async doit(action) {
        throw new Error("Abstract method 'doit' must be implemeted");
    }

    /**
     * Registers the action to the specified allowed actions if possible.
     * @param actions The actions in which to register the instance.
     * @return the instance.
     */
    register(actions) {
        if (this.allowed()) {
            actions.push(this.data());
        }
    }

    /**
     * Gets the token identifier of the specifid actor.
     * @param actorId The identifier of the actor.
     * @returns the token id.
     */
    getTokenId(actorId) {
        const actor = game.combat.data.combatants.find(c => c.actor.id === actorId);
        return actor === undefined ? undefined : actor.token._id;
    }

    /**
     * @returns the only target if exists or null otherwise. 
     */
    getTarget() {
        const targets = this.getTargets();
        return (targets.length === 0 || targets.length > 1) ? null : targets[0];
    }

    /**
     * @returns the targets.
     */
    getTargets() {
        return Array.from(game.user.targets);
    }

    /**
     * Updates the action by adding the roll result.
     * @param action The action to update.
     * @returns the instance.
     */
    async updateRoll(action) {
        const result = await Rolls.getRollResult(ChatMessage.getSpeaker(), action.difficulty);
        action.roll = result;
        return this;
    }

    /**
     * Increases the impact if necessary.
     * @param action The action to update.
     * @return the instance.
     */
    updateImpact(action) {
        if (action.roll.success && action.roll.critical) {
            action.impact = action.impact * 2;
        }
        return this;
    }

    /**
     * Resets the previous rounds of 'visee'.
     * @returns the instance.
     */
    async resetVisee() {
        for (let arme of this.actor.items.filter(i => i.type === 'arme')) {
            await arme.update({['data.ranged.visee']: 0});
        }
        return this;
    }
  
    /**
     * Resets the previous rounds of 'reload'.
     * @returns the instance.
     */
    async resetReload() {
        for (let arme of this.actor.items.filter(i => i.type === 'arme')) {
            await arme.update({['data.ranged.reload']: 0});
        }
        return this;
    }

    /**
     * Resets the covered state.
     * @returns the instance.
     */
    async resetCovered() {
        await this.token.combatant.deactivateEffect(Game.effects.couvert);
        return this;
    }

    /**
     * Resets the covered state.
     * @returns the instance.
     */
    async resetHidden() {
        await this.token.combatant.deactivateEffect(Game.effects.cache);
        return this;
    }

    /**
     * Resets progressing actions.
     * @return the instance.
     */
    async resetProgress() {

        // Resets the bonus of 'visee'
        await this.resetVisee();

        // Resets the bonus of 'reload'
        await this.resetReload();

        return this;

    }

    /**
     * Converts attack roll result to textual description.
     * @param result The result to interpret.
     * @returns the interpreted result.
     */
    attackResult(result) {
        if (result.success) {
            if (result.critical) {
                return "réussit son attaque de façon exceptionnelle";
            } else {
                return "réussit son attaque";
            }
        } else {
            if (result.critical) {
                return "manque complètement son attaque";
            } else {
                return "manque son attaque";
            }
        }
    }

    /**
     * Gets the winner between both opponent
     * @param attack  The attack roll.
     * @param defense The defense roll.
     * @returns the positif if attack is winner, negatif if defense, 0 if equality.
     */
    versus(attack, defense) {
        return this.score(attack) - this.score(defense); 
    }

    /**
     * Getsthe score of the specified roll.
     *   - If fumble   : -2
     *   - If fail     : -1
     *   - If success  : the margin
     *   - If critical : 1000 + the margin
     * @param {*} roll 
     */
    score(roll) {
        if (roll.success) {
            return roll.critical ? 100 : roll.margin;
        } else {
            return roll.critical ? -2 : -1;
        }
    }

    /**
     * @returns the combatant token.
     */
    getToken(combatant) {
        return game.canvas.tokens.get(combatant.data.tokenId);
    }

}