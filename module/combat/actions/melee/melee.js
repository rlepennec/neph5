import { Action } from "../action.js";
import { Effects } from "../../data/effects.js";
import { Protection } from "../../data/protection.js";
import { Game } from "../../../common/game.js";
import { NephilimChat } from "../../../common/chat.js";

export class Melee extends Action {

  /**
   * The type of the action.
   */
  static type = Action.Types.melee.id;

  /**
   * Indicates a target must be selected.
   */
  static targeted = true;

  /**
   * @returns the difficulty of the action.
   */
  difficulty() {

    // Initialization
    const effects = new Effects();

    // Apply the basic skill and the specified modifier
    let difficulty = this.status.melee.difficulty() + this.constructor.attack;

    // Apply the wounds modifier
    difficulty = difficulty + this.status.wounds.getModifier();

    // Apply malus if disoriented
    if (this.disoriented()) {
      difficulty = difficulty + Game.effects.desoriente.modifier;
    }

    // Apply bonus if target is immobilized
    if (effects.isActiveOn(this.target.flags, Game.effects.immobilise)) {
      difficulty = difficulty + Game.effects.immobilise.modifier;
    }

    // Apply malus if on the ground and not the target
    if (this.grounded() && !effects.isActiveOn(this.target.flags, Game.effects.projete)) {
      difficulty = difficulty + Game.effects.projete.modifier;
    }

    // Apply bonus if target on the ground and not the token
    if (!this.grounded() && effects.isActiveOn(this.target.flags, Game.effects.projete)) {
      difficulty = difficulty - Game.effects.projete.modifier;
    }

    // Returns the difficulty of the action
    return difficulty;

  }

  /**
   * @Override
   */
  impact() {
    return this.constructor.impact === null ? 0 : this.weapon().damages + this.constructor.impact + this.status.improvements.get(Game.improvements.damages);
  }

  /**
   * @Override
   * 
   * To be allowed a melee action must validate the following assertions:
   *  - The history of the round allows this action
   *  - Exactly one target has been selected
   *  - The token is not immobilized
   *  - The token is armed with a melee weapon
   */
  allowed() {

    return this.status.history.allowed(this) &&
           this.target != null &&
           this.immobilized() === false &&
           this.status.melee.isArmed();

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
          protection: protection.getProtectionOf(this.target.flags, weapon)
        }
      })
      .withFlags(flags)
      .create();

    return this;

  }

}