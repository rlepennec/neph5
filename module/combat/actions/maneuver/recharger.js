import { Maneuver } from "./maneuver.js";
import { NephilimChat } from "../../../common/chat.js";

export class Recharger extends Maneuver {

  /**
   * The identifier of the action.
   */
  static id = 'recharger';

  /**
   * The name of the action.
   */
  static name = 'Recharger';

  /**
   * The tooltip of the action.
   */
  static tooltip = "Recharge toutes les munitions de son arme";

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
    return "recharche son arme " + this.status.ranged.weapon().description;
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
   * To be allowed a recharger action must validate the following assertions:
   *  - The history of the round allows this action
   *  - The token is not immobilized
   *  - The token is armed with a ranged weapon
   *  - The weapon needs at least more a complete round to be reloaded
   *  - Some ammunitions can be added
   */
   allowed() {

    const weapon = this.status.ranged.weapon();
    return this.status.history.allowed(this) &&
           this.immobilized() === false &&
           this.status.ranged.isArmed() &&
           this.token.combatant.data.flags.world.combat.ranged.utilise > 0 &&
           weapon.data.data.ranged.vitesse > 0;

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

    // Resets the bonus of 'visee'
    await this.resetVisee();

    // Increase the number of round or reload
    const flags = duplicate(this.token.combatant.data.flags);
    flags.world.combat.ranged.reload = flags.world.combat.ranged.reload + 1;
    await this.token.combatant.update({['flags']: flags});

    // Increases the number of ammunitions at the end of the reloading
    const weapon = this.status.ranged.weapon();
    if (weapon.data.data.ranged.vitesse <= flags.world.combat.ranged.reload) {
      const flags = duplicate(this.token.combatant.data.flags);
      flags.world.combat.ranged.utilise = 0;
      flags.world.combat.ranged.reload = 0;
      await this.token.combatant.update({['flags']: flags});
    }

    return this;

  }

}