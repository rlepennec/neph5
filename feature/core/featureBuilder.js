import { Alchimie } from "../alchimie/alchimie.js";
import { Appel } from "../conjuration/appel.js";
import { Arcane } from "../periode/arcane.js";
import { Aspect } from "../selenim/aspect.js";
import { Atlanteide } from "../atlanteide/atlanteide.js";
import { Catalyseur } from "../alchimie/catalyseur.js";
import { Chute } from "../periode/chute.js";
import { Competence } from "../periode/competence.js";
import { Dracomachie } from "../dracomachie/dracomachie.js";
import { Formule } from "../alchimie/formule.js";
import { Habitus } from "../analogie/habitus.js";
import { Invocation } from "../kabbale/invocation.js";
import { Ka } from "../nephilim/ka.js";
import { Magie } from "../magie/magie.js";
import { Materiae } from "../alchimie/materiae.js";
import { Metamorphe } from "../nephilim/metamorphe.js";
import { Noyau } from "../selenim/noyau.js";
import { Ordonnance } from "../kabbale/ordonnance.js";
import { Passe } from "../periode/passe.js";
import { Pavane } from "../selenim/pavane.js";
import { Periode } from "../periode/periode.js";
import { Pratique } from "../denier/pratique.js";
import { Quete } from "../periode/quete.js";
import { Rite } from "../necromancie/rite.js";
import { Rituel } from "../epee/rituel.js";
import { Savoir } from "../periode/savoir.js";
import { Science } from "../science/science.js";
import { Sort } from "../magie/sort.js";
import { Technique } from "../baton/technique.js";
import { Tekhne } from "../coupe/tekhne.js";
import { Vecu } from "../periode/vecu.js";

export class FeatureBuilder {

    /**
     * Constructor.
     * @param actor The actor owner of the feature.
     */
    constructor(actor) {
        this.actor = actor;
    }

    /**
     * @param sid The system identifier which defines the original item to register.
     * @param the instance.
     */
    withOriginalItem(sid) {
        this.sid = sid;
        return this;
    }

    /**
     * @param id The identifier which defines the embedded item to register.
     * @param the instance.
     */
    withEmbeddedItem(id) {
        this.id = id;
        return this;
    }

    /**
     * @param periode The system identifier of the periode to register.
     * @returns the instance.
     */
    withPeriode(periode) {
        this.periode = periode;
        return this;
    }

    /**
     * @param manoeuver The name of te manoeuver to register, 'esquive' or 'lutte'.
     * @returns the instance.
     */
    withManoeuver(manoeuver) {
        this.manoeuver = manoeuver;
        return this;
    }

    /**
     * @param scope The scope to register, 'actor' or 'simulacre'.
     * @returns the instance.
     */
    withScope(scope) {
        this.scope = scope;
        return this;
    }

    /**
     * @param event The drop event.
     * @returns the instance.
     */
    withEvent(event) {
        this.event = event;
        return this;
    }

    /**
     * @param ka The ka element.
     * @returns the instance.
     */
    withKa(ka) {
        this.ka = ka;
        return this;
    }

    /**
     * @returns the instance.
     */
    withNoyau() {
        this.noyau = true;
        return this;
    }

    /**
     * @returns the instance.
     */
    withPavane() {
        this.pavane = true;
        return this;
    }

    /**
     * @returns the embedded or original item.
     */
    item() {

        // The id defines the embedded item
        if (this.id != null) {
            return this.scopedActor().items.get(this.id);
        }
        
        // The sid defines the original item
        if (this.sid != null) {
            return game.items.find(i => i.sid === this.sid);
        }
        
        // No item defined
        return null;

    }

    /**
     * @returns the new feature. 
     */
    create() {

        // Retrieve the world or the embedded item
        const item = this.item();

        // Create the feature
        switch (item?.type) {
            case 'alchimie':
                return new Alchimie(this.actor).withItem(item);
            case 'appel':
                return new Appel(this.actor).withPeriode(this.periode).withItem(item);
            case 'arcane':
                return new Arcane(this.actor).withPeriode(this.periode).withItem(item);
            case 'aspect':
                return new Aspect(this.actor).withItem(item);
            case 'atlanteide':
                return new Atlanteide(this.actor).withPeriode(this.periode).withItem(item);
            case 'catalyseur':
                return new Catalyseur(this.actor).withItem(item);
            case 'chute':
                return new Chute(this.actor).withPeriode(this.periode).withItem(item);
            case 'competence':
                return new Competence(this.actor, item).withManoeuver(this.manoeuver);
            case 'dracomachie':
                return new Dracomachie(this.actor).withPeriode(this.periode).withItem(item);
            case 'formule':
                return new Formule(this.actor).withPeriode(this.periode).withItem(item);
            case 'habitus':
                return new Habitus(this.actor).withPeriode(this.periode).withItem(item);
            case 'invocation':
                return new Invocation(this.actor).withPeriode(this.periode).withItem(item);
            case 'magie':
                return new Magie(this.actor).withItem(item);
            case 'materiae':
                return new Materiae(this.actor).withItem(item);
            case 'metamorphe':
                return new Metamorphe(this.actor).withItem(item);
            case 'ordonnance':
                return new Ordonnance(this.actor, item).withPeriode(this.periode);
            case 'passe':
                return new Passe(this.actor).withPeriode(this.periode).withItem(item);
            case 'periode':
                return new Periode(this.actor, item).withEvent(this.event);
            case 'pratique':
                return new Pratique(this.actor).withPeriode(this.periode).withItem(item);
            case 'quete':
                return new Quete(this.actor).withPeriode(this.periode).withItem(item);
            case 'rite':
                return new Rite(this.actor).withPeriode(this.periode).withItem(item);
            case 'rituel':
                return new Rituel(this.actor).withPeriode(this.periode).withItem(item);
            case 'science':
                return new Science(this.actor).withPeriode(this.periode).withItem(item);
            case 'savoir':
                return new Savoir(this.actor).withPeriode(this.periode).withItem(item);
            case 'sort':
                return new Sort(this.actor).withPeriode(this.periode).withItem(item);
            case 'technique':
                return new Technique(this.actor).withPeriode(this.periode).withItem(item);
            case 'tekhne':
                return new Tekhne(this.actor).withPeriode(this.periode).withItem(item);
            case 'vecu':
                return new Vecu(this.actor, this.scope).withPeriode(this.periode).withItem(item).withManoeuver(this.manoeuver).withEvent(this.event);
            default:
                switch (this.ka) {
                    case 'noyau':
                        return new Noyau(this.actor);
                    case 'pavane':
                        return new Pavane(this.actor);
                    case 'air':
                    case 'eau':
                    case 'feu':
                    case 'lune':
                    case 'terre':
                    case 'soleil':
                        return new Ka(this.actor, this.ka, this.scope);
                    default:
                        return null;
                }
        }
    }

    /**
     * @returns the actor itself or the simulacre of the actor depending on the scope.
     */
    scopedActor() {
        switch (this.actor.type) {
            case 'figure':
                switch (this.scope) {
                    case 'actor':
                        return this.actor;
                    case 'simulacre':
                        return game.actors.find(a => a.sid === this.actor.system?.simulacre);
                }
            case 'figurant':
            case 'fraternite':
                switch (this.scope) {
                    case 'actor':
                        return this.actor;
                    default:
                        throw new Error("Vecu.actor scope " + this.scope + " not implemented");
                }
            default:
                throw new Error("Vecu.actor type " + this.actor.type + " not implemented");
        }
    }

}