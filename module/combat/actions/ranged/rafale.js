import { Ranged } from "./ranged.js";

export class Rafale extends Ranged {

  /**
   * The identifier of the action.
   */
  static id = 'rafale';

  /**
   * The name of the action.
   */
  static name = 'Rafale';

  /**
   * The tooltip of the action.
   */
  static tooltip = "Utilise 5 munitions et peut vider son chargeur";

  /**
   * Indicates others actions can't be performed.
   */
  static exclusive = false;
 
  /**
   * Indicates the number of this action which can be performed.
   */
  static occurence = 3;

  /**
   * The effects produced by the action.
   */
  static effects = [];

  /**
   * The attack modifier.
   */
  static attack = -5;

  /**
   * The defense modifier.
   */
  static defense = 0;

   /**
    * The impact modifier.
    */
  static impact = 2;

  /**
   * The minimum number of ammunitions.
   */
  static required = 5;

  /**
   * The number of ammunitions to use.
   */
  static used = 5;

  /**
   * @Override
   */
  sentence() {
    return "tire en rafale sur " + this.target.name + " avec " + this.status.ranged.weapon().description;
  }

}