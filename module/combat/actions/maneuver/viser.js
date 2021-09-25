import { Maneuver } from "./maneuver.js";
import { NephilimChat } from "../../../common/chat.js";

export class Viser extends Maneuver {

  /**
   * The identifier of the action.
   */
  static id = 'viser';

  /**
   * The name of the action.
   */
  static name = 'Viser';

  /**
   * The tooltip of the action.
   */
  static tooltip = "+20% par round";

  /**
   * Indicates others actions can't be performed.
   */
  static exclusive = false;

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
    return "ajuste son tir sur " + this.target.name + " avec " + this.status.ranged.weapon().description;
  }

  /**
   * @Override
   */
  difficulty() {
    return undefined;
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
   * To be allowed a viser action must validate the following assertions:
   *  - The history of the round allows this action
   *  - Exactly one target has been selected
   *  - The token is armed with a ranged weapon
   *  - The number of rounds of visee is lesser than 3
   */
  allowed() {

    return this.status.history.allowed(this) &&
           this.target != null &&
           this.immobilized() === false &&
           this.status.ranged.isArmed() &&
           this.token.combatant.data.flags.world.combat.ranged.visee < 3;

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

    // Resets the bonus of 'reload'
    await this.resetReload();

    // Resets the bonus of 'hidden'
    await this.resetHidden();

    // Increase the number of round
    const flags = duplicate(this.token.combatant.data.flags);
    flags.world.combat.ranged.visee = flags.world.combat.ranged.visee + 1;
    await this.token.update({['flags']: flags});
    return this;

  }

}