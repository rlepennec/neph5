import { Melee } from "./melee.js";

export class Subtile extends Melee {

  /**
   * The identifier of the action.
   */
   static id = 'subtile';

  /**
   * The name of the action.
   */
  static name = 'Subtile';
 
  /**
   * The tooltip of the action.
   */
  static tooltip = "-40% à la défense adverse";

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
  static defense = -4;

  /**
   * The impact modifier.
   */
  static impact = 0;

  /**
   * @Override
   */
  sentence() {
    return "porte une attaque subtile sur " + this.target.name + " avec " + this.status.melee.weapon().description;
  }

}