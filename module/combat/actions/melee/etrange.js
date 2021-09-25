import { Melee } from "./melee.js";

export class Etrange extends Melee {

  /**
   * The identifier of the action.
   */
  static id = 'etrange';

  /**
   * The name of the action.
   */
  static name = 'Etrange';

  /**
   * The tooltip of the action.
   */
  static tooltip = "-20% à toutes les actions de l'adversaire au prochain round";

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
  static effects = [
    {
      id: "desoriente",
      duration: 1
    }
  ]

  /**
   * The attack modifier.
   */
  static attack = -3;

  /**
   * The defense modifier.
   */
  static defense = 0;

  /**
   * The impact modifier.
   */
  static impact = 0;

  /**
   *  @Override
   */
  sentence() {
    return "porte une attaque étrange sur " + this.target.name + " avec " + this.status.melee.weapon().description;
  }

}