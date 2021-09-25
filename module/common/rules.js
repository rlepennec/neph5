import { Effects } from "../combat/data/effects.js";
import { Game } from "./game.js";

export class Rules {

  /**
   * Applies the impact to the specified token. The weapon used
   * to strike defines the type of armor to use. The protection must
   * be usable for the striken manoeuver.
   * @param token   The token of the character which receives the strike.
   * @param weapon  The weapon used to strike.
   * @param impact  The impact of the strike.
   */
  static applyProtection(token, weapon, impact) {
    const protection = this.getProtection(token, weapon);
    return Math.max(impact - protection, 0);
  }

  /**
   * Gets the protection used versus the specified weapon.
   * @param token  The token of the character which receive the strike.
   * @param weapon The weapon used to strike.
   * @returns the value of the protection against the strike.
   */
  static getProtection(token, weapon) {

    if (weapon.skill === 'martial') {
      return token.combatant.data.flags.combat.protection.contact;
    }

    if (weapon.skill === 'melee') {
      return token.combatant.data.flags.combat.protection.contact;
    }

    if (weapon.skill === 'trait') {
      return token.combatant.data.flags.combat.protection.trait;
    }

    if (weapon.skill === 'feu') {
      return token.combatant.data.flags.combat.protection.feu;
    }

    if (weapon.skill === 'lourde') {
      return token.combatant.data.flags.combat.protection.feu;
    }

  }

  /**
   * Converts the specified result to damages.
   * @param token      The token of the defenser.
   * @param action     The action of the attacker.
   * @param manoeuvre  The manoeuvre of the attacker.
   * @param result     The defense result to interpret.
   * @param impact     The damage of the attack.
   * @param defense    The type of defense.
   * @param protection The protection to apply.
   * @return the damages.
   */ 
  static damagesOf(token, action, manoeuvre, result, impact, defense, weapon) {

    // No damage for the first round of immobilisation
    if (action === 'contact' && manoeuvre === 'immobilisation') {
      return 0;
    }

    // Projection ignore armure
    if (action === 'contact' && manoeuvre === 'projection') {
      if (result.success === false) {
        return 1;
      } else {
        return 0;
      }
    }

    // The multiplier to apply if a critical roll occurs
    let multiplier = 1;
    if (result.critical === true) {
      multiplier = 2;
    }

    // The modifier to apply
    let modifier = 0;
    if (result.success === true) {
      modifier = Game.defense[defense].success;
    } else {
      modifier = Game.defense[defense].fail;
    }

    // Returns the final damages
    const protection = Rules.getProtection(token, weapon);
    return Math.max(impact + (multiplier * modifier) - protection, 0);

  }

  /**
   * Converts the specified result to string.
   * @param result The result to interpret.
   * @return the interpreted result.
   */
  static resultToString(result) {
    let string = "";    
    if (result.success === true) {
      string = "réussit";
      if (result.critical) {
        string = string + " de façon spectaculaire";
      }
      if (result.margin > 0) {
        string = string + " avec une marge de réussite de " + result.margin.toString();
      }
    } else {
      string = "échoue";
      if (result.critical) {
        string = string + " de façon lamentable";
      }
    }
    return string;
  }

  /**
   * Interprets the specified roll for the specified difficulty.
   * @returns the interpretation of the roll.
   */
  static resultOf(roll, difficulty) {

    // 1 is always a success
    if (roll.result === 1) {
      return {
        success: true,
        critical: false,
        margin: 0
      }

    // 100 is always a fail
    } else if (roll.result === 100) {
      return {
        success: false,
        critical: difficulty === 0,
        margin: 0
      }
    
    // Success if the roll is lesser than the difficulty
    } else {
      return {
        success: roll.result <= (difficulty * 10),
        critical: roll.double,
        margin: roll.dizaine + Math.max(difficulty - 10, 0)
      }

    }

  }

  /**
   * Interprets the specified roll for the specified difficulty.
   * @returns the interpretation of the roll.
   */
   static compareResult(attaque, defense) {

      const A = 'attaque';
      const N = 'aucun';
      const D = 'defense';

      if (attaque.success === false && attaque.critical === true) {           // Attaque Maladresse
        if (defense.success === false && defense.critical === true) {         // Defense Maladresse
          return N;
        }
        return D;
      }

      if (attaque.success === false && attaque.critical === false) {            // Attaque Echec
        if (defense.success === true) {                                         // Defense succes/+
          return D;
        }
        if (defense.success === false && defense.critical === true) {   // Defense maladresse
          return A;
        }                                                                // Defense echec
        return N;
      }

      if (attaque.success === true && attaque.critical === false) {             // Attaque success
        if (defense.success === true &&  defense.critical === true) {           // Defense critique
          return 'defenseur';
        }
        if (defense.success === false) {                                // Defense echec/+
          return A;
        }
      }

      if (attaque.success === true && attaque.critical === true) {
        if (defense.success === false || defense.critical === false) {
          return A;
        }
      }

      if (attaque.margin > defense.margin) {
        return A;
      }
      if (attaque.margin < defense.margin) {
        return D;
      }
      return N;

  }

  /**
   * Rolls a d100.
   * @param content The content of the message to display.
   * @return an object with the roll result and if it's double.
   */
  static async roll(content) {
    const roll = new Roll("1d100", {});
    await roll.roll().toMessage({
      speaker: ChatMessage.getSpeaker(),
      content: content
    }, { async:true });
    await new Promise(r => setTimeout(r, 2000));
    const v = parseInt(roll.result, 10);
    return {
      result: v,
      double: Rules.isDouble(v),
      dizaine: Math.floor(v / 10)
    }
  }

  /**
   * Indicates if the specified roll indicates a critical success.
   * @param roll The roll to process.
   * @return true if the roll is a double.
   */
  static isDouble(v) {
    return v === 11 || v === 22 || v === 33 || v === 44 || v === 55 || v === 66 || v === 77 || v === 88 || v === 99; 
  }

  /**
   * Indicates if the specified defense is usdable for the specified character against
   * the specified attack.
   * @param token The token of the defenser.
   * @param attaque The attaque to check.
   * @param defense The defense to check.
   * @returns true if the defense is possible.
   */
  static isUsable(token, attaque, defense) {

    if (attaque === 'immobilisation') {
      return defense === 'standard' || defense === 'fuite';
    }

    if (attaque === 'projection') {
      return defense === 'standard' || defense === 'fuite';
    }

    if (attaque === 'frappe') {
      return defense === 'standard' || defense === 'fuite';
    }

    // Frappe a main nue ou coup d'arme
    return token.combatant.data.flags.combat.bouclier || token.combatant.data.flags.combat.contact.blocage;
  }

}


