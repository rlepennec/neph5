import { Defense } from "./defense.js";

export class Eviter extends Defense {

  /**
   * The identifier of the action.
   */
  static id = 'eviter';

  /**
   * The name of the action.
   */
  static name = 'Eviter';
 
  /**
   * The type of the action.
   */
  static type = Defense.type;

  /**
   * The tooltip of the action.
   */
  static tooltip = "-1 dommage";

  /**
   * Indicates others actions can't be performed.
   */
  static exclusive = false;
 
  /**
   * Indicates the number of this action which can be performed.
   */
  static occurence = null;

  /**
   * Indicates a target must be selected.
   */
  static targeted = false;

  /**
   * The effects produced by the action.
   */
  static effects = [];

  /**
   * The attack modifier.
   */
  static attack = null;

  /**
   * The defense modifiers.
   *   - For each defense roll
   *   - For each additional roll after the first one
   */
  static defense = {
    basic: 0,
    additional: -2
  };
 
  /**
   * The impact modifier.
   */
  static impact = null;

  /**
   * The impact protection.
   *   - If the defense roll is a success
   *   - If the defense roll is a fumble
   */
  static protection = {
    success: -1,
    fumble: 0
  };

  /**
   * @Override
   */
  sentence() {
    return "évite l'attaque";
  }

  /**
   * @Override
   */
  difficulty() {
    const skill = this.token.actor.getSkill('best.of.esquive.melee.martial');
    return super.difficulty() + skill;
  }

}