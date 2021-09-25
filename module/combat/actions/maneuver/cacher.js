import { Maneuver } from "./maneuver.js";
import { Game } from "../../../common/game.js";
import { NephilimChat } from "../../../common/chat.js";

export class Cacher extends Maneuver {

  /**
   * The identifier of the action.
   */
  static id = 'cacher';

  /**
   * The name of the action.
   */
  static name = 'Se cacher';

  /**
   * The tooltip of the action.
   */
   static tooltip = "Esquive + 100% comme malus";

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
  static effects = [
    {
      id: "cache"
    }
  ];

  /**
   * @Override
   */
  sentence() {
    return "se cache";
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
   * To be allowed a relever action must validate the following assertions:
   *  - The history of the round allows this action
   *  - The token is not immobilized
   *  - The token is not hidden
   */
   allowed() {

    return this.status.history.allowed(this) &&
           this.immobilized() === false &&
           this.hidden() === false;

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

    // Resets the bonus of 'visee'
    await this.resetVisee();

    // Resets the bonus of 'reload'
    await this.resetReload();

    // Resets the bonus of 'covered'
    await this.resetCovered();

    // Update the effect 'hidden'
    await this.status.effects.activate(Game.effects.cache);

    return;

  }

}