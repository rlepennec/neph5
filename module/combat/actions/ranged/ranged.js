import { Action } from "../action.js";
import { Effects } from "../../data/effects.js";
import { Protection } from "../../data/protection.js";
import { Game } from "../../../common/game.js";
import { NephilimChat } from "../../../common/chat.js";

export class Ranged extends Action {

  /**
   * The type of the action.
   */
  static type = Action.Types.ranged.id;

  /**
   * Indicates a target must be selected.
   */
  static targeted = true;

  /**
   * @Override
   */
  difficulty() {

    // Initialization
    const effects = new Effects(this.target.token.combatant);

    // Apply the basic skill and the specified modifier
    let difficulty = this.status.ranged.difficulty() + this.constructor.attack;

    // Apply the wounds modifier
    difficulty = difficulty + this.status.wounds.getModifier('physique');

    // Apply malus if disoriented
    if (this.status.effects.isActive(Game.effects.desoriente)) {
      difficulty = difficulty + Game.effects.desoriente.modifier;
    }

    // Apply bonus if target immobilized
    if (effects.isActive(Game.effects.immobilise)) {
      difficulty = difficulty + Game.effects.immobilise.modifier;
    }

    // Apply malus is target is covered
    if (effects.isActive(Game.effects.couvert)) {
      difficulty = difficulty + Game.effects.couvert.modifier + this.target.dodge;
    }

    // Apply malus is target is hidden
    if (effects.isActive(Game.effects.cache)) {
      difficulty = difficulty + Game.effects.cache.modifier + this.target.dodge;
    }

    // Apply bonus for each round of 'visee'
    difficulty = difficulty + this.status.ranged.modifier();

    // Returns the difficulty of the action
    return difficulty;

  }

  /**
   * @Override
   */
  impact() {
    return this.weapon().data.data.damages + this.constructor.impact;
  }

  /**
   * @Override
   * 
   * To be allowed a melee action must validate the following assertions:
   *  - The history of the round allows this action
   *  - Exactly one target has been selected
   *  - The token is not immobilized
   *  - The token is armed with a ranged weapon
   *  - The weapon supports the action
   *  - Enough ammunitions to perform the action
   *  - The token is not hidden
   */
   allowed() {
     const wp = this.weapon();
     if (wp === null || wp === undefined) {
       return false;
     }
      const reste = wp.data.data.ranged.munitions - this.token.combatant.data.flags.world.combat.ranged.utilise;
      return this.status.history.allowed(this) &&
            this.target != null &&
            this.immobilized() === false &&
            this.status.ranged.support(this) &&
            this.constructor.required <= reste;

  }

  /**
   * @Override
   */
  weapon() {
    return this.status.ranged.weapon();
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

    // Fetches the weapon used to perform the action
    

    // Resets all progressing actions
    await this.resetProgress();

    // Resets the bonus of 'hidden'
    await this.resetHidden();

    // Decreases the ammunition number
    await this.decreaseAmmunitions();

    // Rolls dices
    await this.updateRoll(action);

    // Fetches the some datas to perform actions
    const weapon = this.weapon();
    const protection = new Protection(this.target.token);

    // Increases impact if critical success
    this.updateImpact(action);

    // Adds flags for the chat message to be hooked if necessary
    const flags = action.roll.success ?
      {
        neph5e: {
          action: action
        }
      } : {};

    // Displays the action result. The chat message will be hooked if flags exist 
    await new NephilimChat(this.actor)
      .withTemplate("systems/neph5e/templates/dialog/combat/combat-result.hbs")
      .withData({
        action: action,
        result: {
          roll: this.attackResult(action.roll),
          protection: protection.getProtectionOf(this.target, weapon.data)
        }
      })
      .withFlags(flags)
      .create();

    return this;

  }

  /**
   * Decreases the number of munitions according to action.
   * @returns the instance.
   */
  async decreaseAmmunitions() {
    const weapon = this.weapon();
    if (weapon.data.data.ranged.vitesse > 0) {
      const flags = duplicate(this.token.combatant.data.flags);
      flags.world.combat.ranged.utilise = Math.min(weapon.data.data.ranged.munitions, flags.world.combat.ranged.utilise + this.constructor.used);
      await this.token.combatant.update({['flags']: flags}); 
    }
    return this;
  }

}