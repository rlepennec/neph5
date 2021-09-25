import { CustomHandlebarsHelpers } from "../common/handlebars.js";
import { Rolls } from "../common/rolls.js";
import { Game } from "../common/game.js";
import { getByPath } from "../common/tools.js";
import { Strike } from "../combat/actions/strike.js";
import { Fire } from "../combat/actions/fire.js";
import { Defend } from "../combat/actions/defend.js";
import { Equipment } from "../combat/actions/equipment.js";
import { State } from "../combat/actions/state.js";

export class NephilimActor extends Actor {

  /**
   * @returns true if the combat macro are locked.
   */
  unlocked() {
    if (this.locked === undefined) {
      return true;
    }
    return !this.locked;
  }

  /**
   * Locks the combat macros.
   * @returns the instance.
   */
  lock() {
    this.locked = true;
  }

  /**
   * Locks the combat macros.
   * @returns the instance.
   */
  unlock() {
    this.locked = false;
  }

  /**
   * Executes the related macro.
   * @param token The token for which to execute the macro.
   */
  async etat(token) {
    if (game.combat === null) {
      ui.notifications.warn("Aucun combat !");
      return;
    }
    if (token.combatant === null) {
      ui.notifications.warn("Vous n'êtes pas en combat !");
      return;
    }
    if (this.unlocked()) {
      this.lock();
      await new State(this, token).doit();
    }
  }

  /**
   * Executes the related macro.
   * @param token The token for which to execute the macro.
   */
  async equipement(token) {
    if (game.combat === null) {
      ui.notifications.warn("Aucun combat !");
      return;
    }
    if (token.combatant === null) {
      ui.notifications.warn("Vous n'êtes pas en combat !");
      return;
    }
    if (this.unlocked()) {
      this.lock();
      await new Equipment(this, token.combatant).doit();
    }
  }

  /**
   * Executes the related macro.
   * @param token The token for which to execute the macro.
   */
  async frapper(token) {
    if (game.combat === null) {
      ui.notifications.warn("Aucun combat !");
      return;
    }
    if (token.combatant === null) {
      ui.notifications.warn("Vous n'êtes pas en combat !");
      return;
    }
    if (this.unlocked()) {
      await new Strike(this, token).doit();
    }
  }

  /**
   * Executes the related macro.
   * @param token The token for which to execute the macro.
   */
  async tirer(token) {
    if (game.combat === null) {
      ui.notifications.warn("Aucun combat !");
      return;
    }
    if (token.combatant === null) {
      ui.notifications.warn("Vous n'êtes pas en combat !");
      return;
    }
    if (this.unlocked()) {
      await new Fire(this, token).doit();
    }
  }

  /**
   * Executes the related macro.
   * @param token  The token for which to execute the macro.
   * @param event  The chat message id which triggers the defense.
   * @param action The attack which triggers the defense.
   */
  async react(token, event, action) {
    await new Defend(this, token, event, action).doit();
  }

  /**
   * Executes the pentacle macro.
   */
   async ka() {
    if (this.unlocked()) {
      await this.rollKa(this.getMajorKa());
    }
  }

  /**
   * Executes the skill macro.
   */
  async skill(uuid) {
    if (this.unlocked()) {
      await CustomHandlebarsHelpers.getItem(uuid).roll(this);
    }
  }

  // ----------------------------------------------------------------------------------------------

  getCompetenceById(id) {
    const competence = CustomHandlebarsHelpers.getItem(id);
    if (this.data.type === "figure") {
      return this.getCompetence(competence);
    } else if (this.data.type = "figurant") {
      return this.getCompetenceOfFigurant();
    } else if (this.data.type === "simulacre") {
      return this.getCompetenceOfSimulacre(competence);
    } else {
      return 0;
    }
  }

  /**
   * @override
   */
  async _onDelete(options, userId) {
    super._onDelete(options, userId);
  }

  /**
   * @returns the simulacre of the actor.
   */
  getSimulacre() {
    const refId = this.data.data.simulacre.refid;
    return refId === null ? null : CustomHandlebarsHelpers.getActor(refId);
  }

  /**
   * Gets the level og the specified ka for the specified construct.
   * @param substance The substance which defines the construct to get.
   * @param elements  The elements for which to get the ka.
   * @returns the level of the specified ka.
   */
  getKaOfConstruct(substance, elements) {
    const construct = this.getConstruct(substance);
    return elements.length === 1 ? construct[elements[0]] ?? 0 : Math.min(construct[elements[0]] ?? 0, construct[elements[1]] ?? 0);
  }

  /**
   * Gets the construct associated with the specified substance.
   * @param substance The substance of the construct to get.
   * @return the construct.
   */
  getConstruct(substance) {
    switch (substance) {
      case 'ambre':
        return this.data.data.alchimie.constructs.cornue;
      case 'liqueur':
        return this.data.data.alchimie.constructs.alambic;
      case 'metal':
        return this.data.data.alchimie.constructs.creuset;
      case 'poudre':
        return this.data.data.alchimie.constructs.athanor;
      case 'vapeur':
        return this.data.data.alchimie.constructs.aludel;  
    }
  }

  /**
   * @returns the major ka element.
   */
  getMajorKa() {
    switch (this.data.type) {
      case 'figure':
        let major = null;
        let degre = 0;
        for (let elt of Object.keys(this.data.data.ka)) {
          if (elt != 'reserve') {
            const value = this.data.data.ka[elt];
            if (degre <= value) {
              major = elt;
              degre = value;
            }
          }
        }
        return major;
      case 'figurant':
        return 'ka';
      case 'simulacre':
        return 'soleil';      
    }
  }

  /**
   * Gets the level of the specified ka.
   * @param element The element of the ka to get. Allowed ka are:
   *   air,
   *   brume,
   *   eau,
   *   feu,
   *   lune,
   *   noyau,
   *   orichalque,
   *   reserve,
   *   soleil,
   *   terre
   * @returns the level of the specified ka.
   */
  getKa(element) {
    switch (this.data.type) {
      case 'figure':
        return this.data.data.ka[element] ?? 0;
      case 'figurant':
        return this.data.data.ka;
      case 'simulacre':
        return this.data.data.soleil;
    }
    
  }

  /**
   * Gets the level of the specified attribute.
   * @param attribute The attribute for which to get the level. Allowed attributes are:
   *   agile,
   *   endurant,
   *   fort,
   *   intelligent,
   *   seduisant,
   *   soleil,
   *   fortune,
   *   savant,
   *   sociable
   * @returns the attribute level or -1 if not found.
   */
  getAttribute(attribute) {
    const simulacre = this.getSimulacre();
    return simulacre === null ? -1 : simulacre.data.data[attribute] ?? -1;
  }

  /**
   * Gets the sum of the level of the specified items for all active periodes.
   * @param items The items of the periodes in which to find. The allowed items are:
   *   quetes,
   *   savoirs,
   *   arcanes,
   *   chutes
   * @param item The item for which to get the sum of the levels.
   * @returns the sum of the levels.
   */
  getSumFrom(items, item) {
    let sum = 0;
    for (let periode of this.data.data.periodes) {
      if (periode.active === true) {
        for (let i of periode[items]) {
          if (i.refid === item.data.data.id) {
            sum = sum + i.degre;
          }
        }
      }
    }
    return sum;
  }

  /**
   * Gets for each item of the specified items the sums of the level for all active periodes.
   * @param items The items of the periodes in which to find. The allowed items are:
   *   quetes,
   *   savoirs,
   *   arcanes,
   *   chutes
   * @returns the array of the ordered items.
   */
  getLevelsFrom(items) {
    const sums = [];
    for (let periode of this.data.data.periodes) {
      if (periode.active === true) {
        for (let item of getByPath(periode, items)) {
          const index = sums.findIndex(i => (i.refid === item.refid));
          if (index === -1) {
            sums.push({
              refid: item.refid,
              name: CustomHandlebarsHelpers.getItem(item.refid).data.name,
              degre: item.degre,
              next: this.getNextCost(item.degre+1)
            });
          } else {
            sums[index].degre = sums[index].degre + item.degre;
            sums[index].next = this.getNextCost(sums[index].degre+1);
          }
        }
      }
    }
    sums.sort((fst,snd) => (fst.name > snd.name) ? 1 : ((snd.name > fst.name) ? -1 : 0));
    return sums;
  }

  /**
   * Gets the sum  of the level of the specified items for all active periodes.
   * @param name The reference name of the science for which to get the sum of the levels. Allowed names are:
   *   oeuvreAuNoir
   *   basseMagie
   * @returns the sums of the levels.
   */
  getScience(name) {
    let sum = 0;
    for (let periode of this.data.data.periodes) {
      if (periode.active === true) {
        for (let i of periode.sciences) {
          if (i.ref === name) {
            sum = sum + i.degre;
          }
        }
      }
    }
    return sum;
  }

  /**
   * Gets the level of the specified items for the first active periodes.
     @param items The items of the periodes in which to find. The allowed items are:
   *   vecus
     @param item The item for which to get the level.
   * @returns 
   */
  getLevelFrom(items, item) {
    for (let periode of this.data.data.periodes) {
      if (periode.active === true) {
        for (let i of periode[items]) {
          if (i.refid === item.data.data.id) {
            return i.degre;
          }
        }
      }
    }
    return 0;
  }

  /**
   * @returns the level of the combat skill of the character.
   */
  getCompetenceOfFigurant() {
    return this.data.data.menace;
  }

  /**
   * Gets the level of the specified skill of the simulacre.
   * @param competence The skill for which to get the level.
   * @returns the level.
   */
  getCompetenceOfSimulacre(competence) {
    const vecu = CustomHandlebarsHelpers.getItem(this.data.data.vecu.refid);
    if (vecu != undefined) {
      for (let refCompetence of vecu.data.data.competences) {
        if (refCompetence.refid === competence.data.data.id) {
          return this.data.data.vecu.degre;
        }
      }
    }
    return 0;
  }

  /**
   * Gets the level of the specified character skill according to the active periodes.
   * Degre is computed according to the sum of the sapience points.
   * @param competence The skill for which to get the level.
   * @returns the level.
   */
  getCompetence(competence) {

    // Retrieve the cost for each vecu
    let sum = this.getCompetenceSum(competence);

    // Retrieve the degre from the total cost
    let degre = 0;
    let cost = 0;
    while (cost <= sum) {
      degre = degre + 1;
      cost = this.getCostTo(degre);
    }

    return degre-1;

  }

  /**
   * Gets the sum of the sapience points
   * @param competence 
   * @returns the sum of the points
   */
  getCompetenceSum(competence) {
    let sum = 0;
    for (let periode of this.data.data.periodes) {
      if (periode.active === true) {
        for (let v of periode.vecus) {
          const vecu = CustomHandlebarsHelpers.getItem(v.refid);
          for (let refCompetence of vecu.data.data.competences) {
            if (refCompetence.refid === competence.data.data.id) {
              sum = sum + this.getCostTo(v.degre);
            }
          }
        }
      }
    }
    return sum;
  }

  /**
   * Gets the sapience points used to rise the degre of skill from 0 to degre.
   * @param degre The final degre of the skill.
   * @returns the necessary sapience points.
   */
  getCostTo(degre) {
    switch (degre) {
      case 0:
        return 0;
      case 1:
        return 1;
      case 2:
        return 3; //1+2
      case 3:
        return 6; //1+2+3
      case 4:
        return 10; //1+2+3+4
      case 5:
        return 15; //1+2+3+4+5
      case 6:
        return 25; //1+2+3+4+5+10
      case 7:
        return 40; //1+2+3+4+5+10+15
      case 8:
        return 60; //1+2+3+4+5+10+15+20
      case 9:
        return 90; //1+2+3+4+5+10+15+20+30
      default:
        return 1+2+3+4+5+10+15+20+30+(degre-9)*100; //90+n*100
    }
  }

  getNextCost(degre) {
    switch (degre) {
      case 0:
        return 0;
      case 1:
        return 1;
      case 2:
        return 2;
      case 3:
        return 3;
      case 4:
        return 4;
      case 5:
        return 5;
      case 6:
        return 10;
      case 7:
        return 15;
      case 8:
        return 20;
      case 9:
        return 30;
      default:
        return 100;
    }
  }

  /**
   * Rolls the specified character ka.
   * @param element The element for which to roll.
   */ 
  async rollKa(element) {
    const ka = element === 'noyau' ? 'Noyau'
     : element === 'tenebre' ? 'Art ténébreux'
     : element === 'ka' ? 'Ka'
     : ('Ka ' + element);
    const filename = element === 'noyau' ? 'noyau.jpg' : 'ka.jpg';
    return await Rolls.check(
      this,
      {img: 'systems/neph5e/icons/' + filename},
      ka,
      {
        ...this.data,
        owner: this.id,
        difficulty: this.getKa(element),
        sentence: "utilise son " + ka
      });
  }

  /**
   * Rolls the specified character attribute.
   * @param uuid      The uuid of the actor for which to roll dices. 
   * @param attribute The name of the attribute roll.
   */
  async rollSimulacre(uuid, attribute) {

    const simulacre = CustomHandlebarsHelpers.getActor(uuid);
    let sentence = "";
    let difficulty = 0;

    switch (attribute) {
      case 'agile':
        difficulty = simulacre.data.data.agile;
        sentence = "fait appel à son agilité";
        break;
      case 'endurant':
        difficulty = simulacre.data.data.endurant;
        sentence = "fait appel à son endurance";
        break;
      case 'fort':
        difficulty = simulacre.data.data.fort;
        sentence = "fait appel à sa force";
        break;
      case 'intelligent':
        difficulty = simulacre.data.data.intelligent;
        sentence = "fait appel à son intelligence";
        break;
      case 'seduisant':
        difficulty = simulacre.data.data.seduisant;
        sentence = "fait appel à son charisme";
        break;
      case 'soleil':
        difficulty = simulacre.data.data.soleil;
        sentence = "fait appel à sa volonté";
        break;
      case 'savant':
        difficulty = simulacre.data.data.savant;
        sentence = "fait appel à son savoir";
        break;
      case 'sociable':
        difficulty = simulacre.data.data.sociable;
        sentence = "fait appel à ses relations";
        break;
      case 'fortune':
        difficulty = simulacre.data.data.fortune;
        sentence = "utilise sa fortune";
        break;
      case 'vecu':
        difficulty = simulacre.data.data.vecu.degre;
        sentence = "utilise l'expérience de son simulacre";
        break;
    }

    return await Rolls.check(
      this, 
      {img: 'systems/neph5e/icons/caracteristique.jpg'},
      attribute,
      {
        ...this.data,
        owner: this.id,
        difficulty: difficulty,
        sentence: sentence,
      });

  }

  /**
   * Gets the level of the specified skill according to the active periodes.
   * @param name The name of the skill for which to get the level. 
   * @returns the skill level.
   */
  getSkill(name) {
    switch (name) {
      case 'melee':
        return this.getCompetenceById(Game.skills.melee.uuid);
      case 'esquive':
        return this.getCompetenceById(Game.skills.esquive.uuid);
      case 'martial':
        return this.getCompetenceById(Game.skills.martial.uuid);
      case 'best.of.esquive.melee.martial':
        const melee = this.getCompetenceById(Game.skills.melee.uuid);
        const esquive = this.getCompetenceById(Game.skills.esquive.uuid);
        const martial = this.getCompetenceById(Game.skills.martial.uuid);
        return Math.max(melee, esquive, martial);
      case 'trait':
        return this.getCompetenceById(Game.skills.trait.uuid);
      case 'feu':
        return this.getCompetenceById(Game.skills.feu.uuid);
      case 'lourde':
        return this.getCompetenceById(Game.skills.lourde.uuid);
      default:
        return 0;      
    }
  }

}