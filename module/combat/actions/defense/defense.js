import { Action } from "../action.js";
import { Game } from "../../../common/game.js";
import { Frappe } from "../unarmed/frappe.js";
import { NephilimChat } from "../../../common/chat.js";

export class Defense extends Action {

  /**
   * The type of the action.
   */
  static type = Action.Types.defense.id;

  /**
   * Constructor.
   * @param actor  The actor which performs the action.
   * @param token  The token for which performs the action.
   * @param attack The attack action which triggers the defense.
   */
  constructor(actor, token, attack) {
    super(actor, token, attack.actor);
    this.attack = attack;
  }

  /**
   * @Override
   */
  difficulty() {

    // Apply the basic and the additional defense modifiers
    let difficulty = this.constructor.defense.basic + this.constructor.defense.additional * this.status.history.sizeOf(this);

    // Apply the basic attack modifier.
    difficulty = difficulty + this.attack.defense;

    // Apply the wounds modifier
    difficulty = difficulty + this.status.wounds.getModifier();

    // Apply malus if disoriented
    if (this.status.effects.isActive(Game.effects.desoriente)) {
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

    return this.status.history.allowed(this) &&
           this.immobilized() === false;

  }

  /**
   * @Override
   */
  weapon() {
    return this.status.melee.weapon();
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

    // Fetches some data to perform the action
    const weapon = this.attack.actor.weapon;

    // Fetches the data protection
    const protection = this.status.protection.getProtection(weapon);

    // Gets the damages according to the effects, tha attack, the protection and the defense roll
    const damages = this.damages(action.roll.success, this.attack.impact - protection + reduction);

    // Apply the effects
    const effects = await this.effects(action.roll);

    // Apply the damages
    let wound = await this.status.wounds.applyDamages(damages);

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
          wound: wound === null ? "ne reçoit aucune blessure" : ("reçoit " + wound.sentence),
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

    // Fetches some data
    const weapon = this.attack.actor.weapon;

    // Fetches the data protection
    const protection = this.status.protection.getProtection(weapon);

    // Gets the damages according to the effects, tha attack and the protection
    const damages = this.damages(false, this.attack.impact - protection);

    // Apply the effects
    const effects = await this.effects();

    // Apply the damages
    let wound = await this.status.wounds.applyDamages(damages);

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
          wound: wound === null ? "ne reçoit aucune blessure" : ("reçoit " + wound.sentence),
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
    if (roll?.success === false) {
      for (let e of this.attack.effects) {
        const effect = Game.effects[e.id];
        if (effect != undefined) {
          await this.status.effects.activate(effect, e.duration);
          effects.push(this.actor.data.name + effect.sentence);
          if (effect.id === Game.effects.desarme.id) {
            await this.status.melee.unset();
          }
          if (effect.id === Game.effects.immobilise.id) {
            await this.status.effects.setRoll(effect, this.attack.roll);
          }
        }
      }
    }
    return effects;
  }

  /**
   * Gets the damages according to the final impact and the effects.
   * @param defended Indicates if the defense roll is successful.
   * @param impact The final impact.
   * @returns the damages.
   */
  damages(defended, impact) {
    for (let e of this.attack.effects) {
      const effect = Game.effects[e.id];
      if (effect != undefined && effect.damages != undefined) {
        return defended ? 0 : effect.damages;
      }
    }
    return Math.max(0, impact);
  }

  /**
   * Gets the modifier to apply if unarmed versus melee attack.
   */
  weaponsModifier() {
    const opponent = this.attack.actor.weapon.skill === Game.skills.melee.id;
    const me = this.status.melee.isArmed();
    if (opponent && !me) {
      return -4;
    }
    if (me && !opponent) {
      return 2;
    }
    return 0;
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