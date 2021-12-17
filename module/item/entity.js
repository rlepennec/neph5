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
        if (this.data.img === 'icons/svg/item-bag.svg') {
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
                case 'arme':
                    this.data.img = "systems/neph5e/icons/arme.webp";
                    break;
                case 'armure':
                    this.data.img = "systems/neph5e/icons/armure.webp";
                    break;
                case 'aspect':
                    this.data.img = "systems/neph5e/icons/aspect.jpg";
                    break;
                case 'capacite':
                    this.data.img = "systems/neph5e/icons/capacite.webp";
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
                case 'passe':
                    this.data.img = "systems/neph5e/icons/passe.webp";
                    break;
                case 'periode':
                    this.data.img = "systems/neph5e/icons/periode.jpg";
                    break;
                case 'pratique':
                    this.data.img = "systems/neph5e/icons/denier.webp";
                    break;
                case 'quete':
                    this.data.img = "systems/neph5e/icons/quete.jpg";
                    break;
                case 'rite':
                    this.data.img = "systems/neph5e/icons/rite.jpg";
                    break;
                case 'rituel':
                    this.data.img = "systems/neph5e/icons/epee.webp";
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
                case 'technique':
                    this.data.img = "systems/neph5e/icons/baton.webp";
                    break;
                case 'tekhne':
                    this.data.img = "systems/neph5e/icons/coupe.webp";
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
                    .forEach(async actor => setItemOf(actor, "metamorphe", { refid: null, metamorphoses: [false, false, false, false, false, false, false, false, false, false] }));
                break;
            case 'chute':
                this.filterActorsBy('chutes', 'refid', this.data.data.id, 'chutes')
                    .forEach(async actor => deleteItemOf(actor, "chutes", "refid", this.data.data.id));
                break;
            case 'passe':
                this.filterActorsBy('passes', 'refid', this.data.data.id, 'passes')
                    .forEach(async actor => deleteItemOf(actor, "passes", "refid", this.data.data.id));
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
            case 'pratique':
                this.filterActorsBy('denier', 'refid', this.data.data.id, 'denier.pratiques')
                    .forEach(async actor => deleteItemOf(actor, "denier", "refid", this.data.data.id, "pratiques"));
                break;
            case 'technique':
                this.filterActorsBy('baton', 'refid', this.data.data.id, 'baton.techniques')
                    .forEach(async actor => deleteItemOf(actor, "baton", "refid", this.data.data.id, "techniques"));
                break;
            case 'tekhne':
                this.filterActorsBy('coupe', 'refid', this.data.data.id, 'coupe.tekhnes')
                    .forEach(async actor => deleteItemOf(actor, "coupe", "refid", this.data.data.id, "tekhnes"));
                break;
            case 'rituel':
                this.filterActorsBy('epee', 'refid', this.data.data.id, 'epee.rituels')
                    .forEach(async actor => deleteItemOf(actor, "epee", "refid", this.data.data.id, "rituels"));
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
                return actor.getScience(this.data.data.cercle) - this.data.data.degre + actor.getKa(this.data.data.element === "luneNoire" ? "noyau" : this.data.data.element); 
            case 'invocation':
                return actor.getScience(this.data.data.sephirah) + actor.getKa(this.data.data.element);
            case 'formule':
                return actor.getScience(this.data.data.cercle) + actor.getKaOfConstruct(this.data.data.substance, this.data.data.elements) - this.data.data.degre;
            case 'competence':
                let base = actor.getCompetence(this);
                if (game.settings.get('neph5e', 'useV3')) {
                    const attribute = actor.getAttribute(this.data.data.inne);
                    base = base + (attribute != -1 ? attribute - 3 : 0);
                }
                return base;
            case 'appel':
            case 'rite':
            case "pratique":
            case "technique":
            case "tekhne":
            case "rituel":
                return actor.getScience(this.data.data.cercle);
            case 'vecu':
                return actor.getLevelFrom('vecus', this);
            case 'quete':
            case 'savoir':
            case 'passe':
            case 'chute':
            case 'arcane':
                return actor.getSumFrom(this.type + 's', this);
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
                return "exécute le rituel d'invocation " + this.data.name;
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
            case 'passe':
                return "fait appel à son passé " + this.data.name;
            case 'arcane':
                return "mobilise sa sapience sur l'arcane " + this.data.name;
            case 'pratique':
                return "utilise la pratique " + this.data.name;
            case 'technique':
                return "utilise la technique " + this.data.name;
            case 'tekhne':
                return "utilise la tekhne " + this.data.name;
            case 'rituel':
                return "pratique le rituel " + this.data.name;
            default:
                return 0;
        }
    }

    // Donen le type de blessure pour appliquer des modificateurs
    blessure() {
        switch (this.type) {
            case 'competence':
            case 'vecu':
                return 'physique';
            case 'sort':
            case 'invocation':
            case 'formule':
            case 'appel':
            case 'rite':
            case 'arcane':
            case 'pratique':
            case 'technique':
            case 'tekhne':
            case 'rituel':
            case 'quete':
            case 'savoir':
                return 'magique';
            case 'chute':
            case 'passe':
                return 'aucune';
            default:
                return 'aucune';
        }
    }

    /**
     * Performs a item roll dice for the specified actor.
     * @param actor The actor for which to roll the dices.
     */
    async roll(actor) {
        return Rolls.check(
            actor,
            this,
            this.type,
            {
                ...this.data,
                owner: actor.id,
                difficulty: this.difficulty(actor),
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