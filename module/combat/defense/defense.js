import { Action } from "../action.js";
import { Game } from "../../common/game.js";
import { Frappe } from "../unarmed/frappe.js";
import { Desarmement } from "../melee/desarmement.js";
import { NephilimChat } from "../../common/chat.js";

export class Defense extends Action {

    /**
     * The type of the action.
     */
    static type = Action.Types.defense.id;

    /**
     * Constructor.
     * @param actor    The actor which performs the defense.
     * @param token    The token for which performs the defense.
     * @param attack   The attack action which triggers the defense.
     */
    constructor(actor, token, attack) {
        super(actor, token, null, attack.actor);
        this.attack = attack;
    }

    /**
     * @Override
     */
    difficulty() {

        // Apply the basic and the additional defense modifiers
        let difficulty = this.constructor.defense.basic + this.constructor.defense.additional * this.token.combatant.getHistorySizeOf(this);

        // Apply the basic attack modifier.
        difficulty = difficulty + this.attack.defense;

        // Apply the wounds modifier
        difficulty = difficulty + this.token.combatant.getWoundsModifier('physique');

        // Apply malus if disoriented
        if (this.effectIsActive(Game.effects.desoriente)) {
            difficulty = difficulty + Game.effects.desoriente.modifier;
        }

        // Returns the difficulty of the action
        return difficulty;

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
     * To be allowed a defense action must validate the following assertions:
     *  - The history of the round allows this action
     *  - The token is not immobilized
     */
    allowed() {

        return this.token.combatant.getAllowedActionFromHistory(this) &&
            this.immobilized() === false;

    }

    /**
     * @Override
     */
    async doit(action) {

        // Displays the action description as chat message
        await new NephilimChat(this.actor)
            .withTemplate("systems/neph5e/templates/dialog/combat/combat-action.hbs")
            .withData({
                action: action
            })
            .create();

        // Resets all progressing actions
        await this.resetProgress();

        // Resets the bonus of 'covered'
        await this.resetCovered();

        // Resets the bonus of 'hidden'
        await this.resetHidden();

        // Rolls dices
        await this.updateRoll(action);

        // Fetches the damage modification
        const reduction = this.reduction(action);

        // Fetches the data protection
        const protection = this.actor.getProtectionVersus(this.attack.actor.weapon);

        // Fetches the impact of the weapon
        const weaponImpact = this.attack.actor.weapon === null ? 1 : this.attack.actor.weapon.data.damages;

        // Gets the damages according to the effects, the attack, the protection and the defense roll
        let damages = 0;
        if (this.attack.id === Desarmement.constructor.id) {
            damages = 0;
        } else if (action.id === 'esquiver' && action.roll.success) {
            damages = 0;
        } else if (action.id === 'contrer' || action.id === 'desarmer') {
            if (action.roll.success) {
                damages = 0;
            } else {
                damages = this.damages(action.roll.success, this.attack.impact - protection + reduction + 2, weaponImpact);
            }
        } else {
            damages = this.damages(action.roll.success, this.attack.impact - protection + reduction, weaponImpact);
        }

        // Retrieve if weapon is magic [TBD: if creature magique]
        const isMagicalWeapon = this.attack.actor.weapon === null ? false : this.attack.actor.weapon.data.magique;

        // Apply the effects (if physical effects)
        const effects = isMagicalWeapon ? [] : await this.effects(action.roll);

        // Apply the damages
        let woundPhysique = await this.token.combatant.applyDamages(damages, 'physique');
        let woundMagique = isMagicalWeapon ? await this.token.combatant.applyDamages(damages, 'magique') : null;

        let woundSentence = null;
        if (woundMagique === null && woundPhysique === null) {
            woundSentence = "ne reçoit aucune blessure";
        } else if (woundMagique === null && woundPhysique !== null) {
            woundSentence = "reçoit " + woundPhysique.sentence;
        } else if (woundMagique !== null && woundPhysique === null) {
            woundSentence = "reçoit " + woundMagique.magique;
        } else {
            woundSentence = "reçoit " + woundPhysique.sentence + " et " + woundMagique.magique;
        }

        // Display the result
        await new NephilimChat(this.actor)
            .withTemplate("systems/neph5e/templates/dialog/combat/combat-result.hbs")
            .withData({
                actor: this.actor,
                action: action,
                result: {
                    roll: this.defenseResult(action.roll),
                    reduction: -reduction,
                    protection: protection,
                    damages: damages,
                    wound: woundSentence,
                    effects: effects
                }
            })
            .create();

        // Process optional processing if defense is a success
        if (action.roll.success) {
            await this.onSuccess(action);
        }

        return this;

    }

    /**
     * Converts defense roll result to textual description.
     * @param result The result to interpret.
     * @returns the interpreted result.
     */
    defenseResult(result) {
        if (result.success) {
            return "parvient à se défendre";
        } else {
            if (result.critical) {
                return "subit l'attaque de plein fouet";
            } else {
                return "subit l'attaque";
            }
        }
    }

    /**
     * Suffers the damages.
     */
    async suffer() {

        // Resets all progressing actions
        await this.resetProgress();

        // Resets the bonus of 'covered'
        await this.resetCovered();

        // Resets the bonus of 'hidden'
        await this.resetHidden();

        // Fetches the data protection
        const protection = this.actor.getProtectionVersus(this.attack.actor.weapon);

        // Fetches the impact of the weapon
        const weaponImpact = this.attack.actor.weapon === null ? 1 : this.attack.actor.weapon.data.damages;

        // Gets the damages according to the effects, tha attack and the protection
        let damages = 0;
        if (this.attack.id === 'desarmement') {
            damages = 0;
        } else {
            damages = this.damages(false, this.attack.impact - protection, weaponImpact);
        }

        // Retrieve if weapon is magic [TBD: if creature magique]
        const isMagicalWeapon = this.attack.actor.weapon === null ? false : this.attack.actor.weapon.data.magique;

        // Apply the effects (if physical effects)
        const effects = isMagicalWeapon ? [] : await this.effects();

        // Apply the damages
        let woundPhysique = await this.token.combatant.applyDamages(damages, 'physique');
        let woundMagique = isMagicalWeapon ? await this.token.combatant.applyDamages(damages, 'magique') : null;

        let woundSentence = null;
        if (woundMagique === null && woundPhysique === null) {
            woundSentence = "ne reçoit aucune blessure";
        } else if (woundMagique === null && woundPhysique !== null) {
            woundSentence = "reçoit " + woundPhysique.sentence;
        } else if (woundMagique !== null && woundPhysique === null) {
            woundSentence = "reçoit " + woundMagique.magique;
        } else {
            woundSentence = "reçoit " + woundPhysique.sentence + " et " + woundMagique.magique;
        }

        // Display the result
        await new NephilimChat(this.actor)
            .withTemplate("systems/neph5e/templates/dialog/combat/combat-result.hbs")
            .withData({
                actor: this.actor,
                action: {
                    type: 'defense',
                    sentence: "subit l'impact sans pouvoir se défendre"
                },
                result: {
                    protection: protection,
                    reduction: 0,
                    impact: this.attack.impact,
                    damages: damages,
                    wound: woundSentence,
                    effects: effects
                }
            })
            .create();

        return this;

    }

    /**
     * Gets the damages modification according to the specfied defense roll result.
     * @param action The defense action. 
     * @returns the damage modification.
     */
    reduction(action) {
        if (action.roll.success) {
            return this.constructor.protection.success;
        }
        if (action.roll.critical) {
            return this.constructor.protection.fumble;
        }
        return 0;
    }

    /**
     * Gets the effects to apply.
     * @param roll The defense roll is successful.
     * @return the effects to display.
     */
    async effects(roll) {
        const effects = [];
        if (roll === undefined || roll?.success === false) {
            for (let e of this.attack.effects) {
                const effect = Game.effects[e.id];
                if (effect != undefined) {
                    await this.token.combatant.activateEffect(effect, e.duration);
                    effects.push(this.actor.data.name + effect.sentence);
                    if (effect.id === Game.effects.desarme.id) {
                        const weaponId = this.attack.target.targetedWeapon;
                        const weapon = this.actor.items.get(weaponId);
                        await weapon.update({['data.used']: false});
                    }
                    if (effect.id === Game.effects.immobilise.id) {
                        await this.token.combatant.setEffectRoll(effect, this.attack.roll);
                    }
                }
            }
        }
        return effects;
    }

    /**
     * Gets the damages according to the final impact and the effects.
     * @param defended Indicates if the defense roll is successful.
     * @param impact The final impact. (impact - protection)
     * @param weaponImpact The impact of the weapon. If 2+ and stopped by armor then 1
     * @returns the damages.
     */
    damages(defended, impact, weaponImpact) {
        for (let e of this.attack.effects) {
            const effect = Game.effects[e.id];
            if (effect != undefined && effect.damages != undefined) {
                return defended ? 0 : effect.damages;
            }
        }
        const impact_final = impact < 1 && weaponImpact > 1 ? 1 : impact;
        return Math.max(0, impact_final);
    }

    /**
     * Gets the modifier to apply if unarmed versus melee attack.
     */
    weaponsModifier() {
        const opponentIsArmed = this.attack.actor.weapon != null;
        const armed = this.imArmed();

        if (opponentIsArmed && !armed) {
            return -4;
        }
        if (armed && !opponentIsArmed) {
            return 2;
        }
        return 0;
    }

    getFirstMeleeWeapon() {
        return this.actor.items.find(i => i.type === 'arme' && i.data.data.skill === 'melee');
    }

    imArmed() {
        return this.actor.items.filter(i => i.type === 'arme' && i.data.data.skill === 'melee').length > 0;
    }

    /**
     * @returns true if the attack is a strike, armed or not.
     */
    isStrike() {
        return this.isArmedStrike() || this.attack.id === Frappe.id;
    }

    /**
     * @returns true if the attack is a strike, armed or not.
     */
    isArmedStrike() {
        return this.attack.type === Action.Types.melee.id;
    }

    /**
     * This method is used if the defense is a success.
     * This method must be overloaded if necessary.
     */
    async onSuccess() {
    }

}