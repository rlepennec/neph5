import { Melee } from "./melee.js";

export class Puissante extends Melee {

  /**
   * The identifier of the action.
   */
  static id = 'puissante';

  /**
   * The name of the action.
   */
  static name = 'Puissante';

  /**
   * The tooltip of the action.
   */
  static tooltip = "+2 dommages";

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
   * The attack modifier.
   */
  static attack = -2;

  /**
   * The defense modifier.
   */
  static defense = 0;

  /**
   * The impact modifier.
   */
  static impact = 2;

  /**
   * @Override
   */
  sentence() {
    return "porte une attaque puissante sur " + this.target.name + " avec " + this.status.melee.weapon().data.name;
  } 

}