import { deleteReferences } from "./tools.js";
import { UUID } from "../common/tools.js";
import { deleteItemOf } from "../actor/tools.js";
import { setItemOf } from "../actor/tools.js";
import { Rolls } from "../common/rolls.js";
import { getByPath } from "../common/tools.js";

export class NephilimItem extends Item {

  /**
   * @override
   */
  prepareData() {
    super.prepareData();
    if (this.data.data.id === "") {
      this.data.data.id = UUID();
    }
    if (this.data.img === 'icons/svg/mystery-man.svg') {
      switch (this.data.type) {
        case 'alchimie':
          this.data.img = "systems/neph5e/icons/voie.jpg";
          break;
        case 'appel':
          this.data.img = "systems/neph5e/icons/appel.jpg";
          break;
        case 'arcane':
          this.data.img = "systems/neph5e/icons/arcane.jpg";
          break;
        case 'aspect':
          this.data.img = "systems/neph5e/icons/aspect.jpg";
          break;
        case 'catalyseur':
          this.data.img = "systems/neph5e/icons/catalyseur.jpg";
          break;
        case 'chute':
          this.data.img = "systems/neph5e/icons/chute.png";
          break;
        case 'competence':
          this.data.img = "systems/neph5e/icons/competence.jpg";
          break;
        case 'formule':
          this.data.img = "systems/neph5e/icons/formule.jpg";
          break;
        case 'invocation':
          this.data.img = "systems/neph5e/icons/invocation.jpg";
          break;
        case 'magie':
          this.data.img = "systems/neph5e/icons/voie.jpg";
          break;
        case 'materiae':
          this.data.img = "systems/neph5e/icons/materiae.jpg";
          break;
        case 'metamorphe':
          this.data.img = "systems/neph5e/icons/metamorphe.jpg";
          break;
        case 'ordonnance':
          this.data.img = "systems/neph5e/icons/voie.jpg";
          break;
        case 'periode':
          this.data.img = "systems/neph5e/icons/periode.jpg";
          break;
        case 'quete':
          this.data.img = "systems/neph5e/icons/quete.jpg";
          break;
        case 'rite':
          this.data.img = "systems/neph5e/icons/rite.jpg";
          break;
        case 'savoir':
          this.data.img = "systems/neph5e/icons/savoir.jpg";
          break;
        case 'science':
          this.data.img = "systems/neph5e/icons/science.jpg";
          break;
        case 'sort':
          this.data.img = "systems/neph5e/icons/sort.jpg";
          break;
        case 'vecu':
          this.data.img = "systems/neph5e/icons/vecu.jpg";
          break;
      }
    }
  }

  /**
   * @Override
   */
  async _onDelete(options, userId) {

    switch (this.data.type) {
      case 'competence':
        deleteReferences(this.data, "vecu", "competences");
        break;
      case 'vecu':
        deleteReferences(this.data, "periode", "vecus");
        break;
      case 'magie':
        deleteReferences(this.data, "sort", "voies");
        this.filterActorsBy("magie", "magie.voie.refid", this.data.data.id)
          .forEach(async actor => setItemOf(actor, "magie", null, "voie.refid"));
        break;
      case 'catalyseur':
        deleteReferences(this.data, "formule", "catalyseurs");
        break;
      case 'formule':
        deleteReferences(this.data, "formule", "variantes");
        this.filterActorsBy("alchimie", "refid", this.data.data.id, "alchimie.formules")
          .forEach(async actor => deleteItemOf(actor, "alchimie", "refid", this.data.data.id, "formules"));
        break;
      case 'metamorphe':
        this.filterActorsBy("metamorphe", "metamorphe.refid", this.data.data.id)
          .forEach(async actor => setItemOf(actor, "metamorphe", {refid : null, metamorphoses : [false, false, false, false, false, false, false, false, false, false]} ));
        break;
      case 'chute':
        this.filterActorsBy('chutes', 'refid', this.data.data.id, 'chutes')
          .forEach(async actor => deleteItemOf(actor, "chutes", "refid", this.data.data.id));
        break;
      case 'sort':
        this.filterActorsBy('magie', 'refid', this.data.data.id, 'magie.sorts')
          .forEach(async actor => deleteItemOf(actor, "magie", "refid", this.data.data.id, "sorts"));
        break;
      case 'invocation':
        this.filterActorsBy('kabbale', 'refid', this.data.data.id, 'kabbale.invocations')
          .forEach(async actor => deleteItemOf(actor, "kabbale", "refid", this.data.data.id, "invocations"));
        break;
      case 'ordonnance':
        this.filterActorsBy('kabbale', 'refid', this.data.data.id, 'kabbale.voie.ordonnances')
          .forEach(async actor => deleteItemOf(actor, "kabbale", "refid", this.data.data.id, "voie.ordonnances"));
        break;
      case 'alchimie':
        this.filterActorsBy("alchimie", "alchimie.voie.refid", this.data.data.id)
          .forEach(async actor => setItemOf(actor, "alchimie", null, "voie.refid"));
        break;
      case 'materiae':
        this.filterActorsBy('alchimie', 'refid', this.data.data.id, 'alchimie.materiae')
          .forEach(async actor => deleteItemOf(actor, "alchimie", "refid", this.data.data.id, "materiae"));
        break;
      case 'aspect':
        this.filterActorsBy('imago', 'refid', this.data.data.id, 'imago.aspects')
          .forEach(async actor => deleteItemOf(actor, "imago", "refid", this.data.data.id, "aspects"));
        break;
      case 'appel':
        this.filterActorsBy('conjuration', 'refid', this.data.data.id, 'conjuration.appels')
          .forEach(async actor => deleteItemOf(actor, "conjuration", "refid", this.data.data.id, "appels"));
        break;
      case 'rite':
        this.filterActorsBy('necromancie', 'refid', this.data.data.id, 'necromancie.rites')
          .forEach(async actor => deleteItemOf(actor, "necromancie", "refid", this.data.data.id, "rites"));
        break;
    }

    super._onDelete(options, userId);

  }

  /**
   * Gets the difficulty of the roll for the specified actor.
   * @param actor The actor for which to get the difficulty.
   * @returns the difficulty.
   */
  difficulty(actor) {
    switch (this.type) {
      case 'sort':
        if (this.data.data.element === "luneNoire") {
          const tenebre = actor.getKa("tenebre");
          const noyau = actor.getKa("noyau");
          return actor.getScience(this.data.data.cercle) + Math.min(tenebre, noyau) - this.data.data.degre;
        } else {
          return actor.getScience(this.data.data.cercle) + actor.getKa(this.data.data.element) - this.data.data.degre;
        }
      case 'invocation':
        return actor.getScience(this.data.data.sephirah) + actor.getKa(this.data.data.element) - this.data.data.degre;
      case 'formule':
        return actor.getScience(this.data.data.cercle) + actor.getKaOfConstruct(this.data.data.substance, this.data.data.elements) - this.data.data.degre;
      case 'appel':
        return actor.getScience(this.data.data.appel);
      case 'rite':
        return actor.getScience(this.data.data.desmos);
      case 'competence':
        const attribute = actor.getAttribute(this.data.data.inne);
        return actor.getCompetence(this) + (attribute != -1 ? attribute - 3 : 0);
      case 'vecu':
        return actor.getLevelFrom('vecus', this);
      case 'quete':
        return actor.getSumFrom('quetes', this);
      case 'savoir':
        return actor.getSumFrom('savoirs', this);
      case 'chute':
        return actor.getSumFrom('chutes', this);
      case 'arcane':
        return actor.getSumFrom('arcanes', this);
      default:
        return 0;
    }
  }

  /**
   * @returns the roll sentence of the roll
   */
  sentence() {
    switch (this.type) {
      case 'sort':
        return "lance le sort " + this.data.name;
      case 'invocation':
        return "invoque " + this.data.name;
      case 'formule':
        return "crée une dose de " + this.data.name;
      case 'appel':
        return "conjure " + this.data.name;
      case 'rite':
        return "effectue le rite de " + this.data.name;
      case 'competence':
        return "mobilise son expérience en " + this.data.name;
      case 'vecu':
        return "mobilise son experience de " + this.data.name;
      case 'quete':
        return "mobilise sa sapience sur " + this.data.name;
      case 'savoir':
        return "mobilise son savoir occulte sur " + this.data.name;
      case 'chute':
        return "contrôle sa chute de " + this.data.name;
      case 'arcane':
        return "mobilise sa sapience sur l'arcane " + this.data.name;
      default:
        return 0;
    }
  }

  /**
   * Performs a item roll dice for the specified actor.
   * @param actor The actor for which to roll the dices.
   */
  async roll(actor) {
    const difficulty = this.difficulty(actor);
    return Rolls.check(
      actor,
      this,
      this.type,
      {
        ...this.data,
        owner: actor.id,
        difficulty: difficulty,
        sentence: this.sentence()
      }
    );
  }

  /**
   * Gets the specified actors. Filtered actors must have the property [root].
   * If the optional paramerer [collection] is defined then each element of the
   * collection must have the property [key]. The filtered pattern is:
   *     actor.data.data.[root]
   *     actor.data.data.[collection][x][key] = value
   * Else the actor must have the property [key]. The filtered pattern is:
   *     actor.data.data.[root]
   *     actor.data.data.[key] = value
   * @param root       The required property.
   * @param key        The property of the element collection or the actor.
   * @param refid      The identifier of the property used to filter actors.
   * @param collection The optional collection.
   * @return the array of the filtered actors.
   */
  filterActorsBy(root, key, value, collection = null) {
    if (collection === null) {
        return Array
            .from(game.actors.values())
            .filter(actor => 
                actor.data.data.hasOwnProperty(root) &&
                actor.data.data[key] === value);
    } else {
        return Array
            .from(game.actors.values())
            .filter(actor => 
                actor.data.data.hasOwnProperty(root) &&
                getByPath(actor.data.data, collection).findIndex(item => (getByPath(item, key) === value)) != -1);
    }
  }

}