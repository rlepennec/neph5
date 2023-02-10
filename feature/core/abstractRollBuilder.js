import { Alchimie } from "../../feature/alchimie/alchimie.js";
import { Appel } from "../../feature/conjuration/appel.js";
import { Arcane } from "../../feature/periode/arcane.js";
import { Aspect } from "../../feature/selenim/aspect.js";
import { Atlanteide } from "../../feature/atlanteide/atlanteide.js";
import { Catalyseur } from "../../feature/alchimie/catalyseur.js";
import { Chute } from "../../feature/periode/chute.js";
import { Competence } from "../../feature/periode/competence.js";
import { Dracomachie } from "../../feature/dracomachie/dracomachie.js";
import { Formule } from "../../feature/alchimie/formule.js";
import { Habitus } from "../../feature/analogie/habitus.js";
import { Invocation } from "../../feature/kabbale/invocation.js";
import { Ka } from "../../feature/nephilim/ka.js";
import { Magie } from "../../feature/magie/magie.js";
import { Materiae } from "../../feature/alchimie/materiae.js";
import { Metamorphe } from "../../feature/nephilim/metamorphe.js";
import { Noyau } from "../../feature/selenim/noyau.js";
import { Ordonnance } from "../../feature/kabbale/ordonnance.js";
import { Passe } from "../../feature/periode/passe.js";
import { Pavane } from "../../feature/selenim/pavane.js";
import { Periode } from "../../feature/periode/periode.js";
import { Pratique } from "../../feature/denier/pratique.js";
import { Quete } from "../../feature/periode/quete.js";
import { Rite } from "../../feature/necromancie/rite.js";
import { Rituel } from "../../feature/epee/rituel.js";
import { Savoir } from "../../feature/periode/savoir.js";
import { Science } from "../../feature/science/science.js";
import { Sort } from "../../feature/magie/sort.js";
import { Technique } from "../../feature/baton/technique.js";
import { Tekhne } from "../../feature/coupe/tekhne.js";
import { Vecu } from "../../feature/periode/vecu.js";

export class AbstractRollBuilder {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     */
    constructor(actor) {
        this.actor = actor;
        this.scope = 'actor';
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
     * @param item The item for which to perform the action.
     * @returns the instance.
     */
    withItem(item) {
        this.item = item;
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
     * @param manoeuver The name of the manoeuver to define, 'esquive' or 'lutte'.
     * @returns the instance.
     */
    withManoeuver(manoeuver) {
        this.manoeuver = manoeuver;
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
     * @param scope Indicates if scope is 'actor' or 'simulacre'.
     * @returns the instance.
     */
    withScope(scope) {
        this.scope = scope;
        return this;
    }

    /**
     * @param event The event which create the feature.
     * @returns the instance.
     */
    withEvent(event) {
        this.event = event;
        return this;
    }

    /**
     * @returns the new feature. 
     */
    create() {
        switch (this?.item?.type) {
            case 'alchimie':
                return new Alchimie(this.actor, this.item);
            case 'appel':
                return new Appel(this.actor, this.item).withPeriode(this.periode);
            case 'arcane':
                return new Arcane(this.actor, this.item, this.periode);
            case 'aspect':
                return new Aspect(this.actor, this.item);
            case 'atlanteide':
                return new Atlanteide(this.actor, this.item).withPeriode(this.periode);
            case 'catalyseur':
                return new Catalyseur(this.actor, this.item);
            case 'chute':
                return new Chute(this.actor, this.item, this.periode);
            case 'competence':
                return new Competence(this.actor, this.item).withManoeuver(this.manoeuver);
            case 'dracomachie':
                return new Dracomachie(this.actor, this.item).withPeriode(this.periode);
            case 'formule':
                return new Formule(this.actor, this.item).withPeriode(this.periode);
            case 'habitus':
                return new Habitus(this.actor, this.item).withPeriode(this.periode);
            case 'invocation':
                return new Invocation(this.actor, this.item).withPeriode(this.periode);
            case 'magie':
                return new Magie(this.actor, this.item);
            case 'materiae':
                return new Materiae(this.actor, this.item);
            case 'metamorphe':
                return new Metamorphe(this.actor, this.item);
            case 'passe':
                return new Passe(this.actor, this.item, this.periode);
            case 'periode':
                return new Periode(this.actor, this.item).withEvent(this.event);
            case 'pratique':
                return new Pratique(this.actor, this.item).withPeriode(this.periode);
            case 'quete':
                return new Quete(this.actor, this.item, this.periode);
            case 'ordonnance':
                return new Ordonnance(this.actor, this.item).withPeriode(this.periode);
            case 'rite':
                return new Rite(this.actor, this.item).withPeriode(this.periode);
            case 'rituel':
                return new Rituel(this.actor, this.item).withPeriode(this.periode);
            case 'savoir':
                return new Savoir(this.actor, this.item, this.periode);
            case 'science':
                return new Science(this.actor, this.item, this.periode);
            case 'sort':
                return new Sort(this.actor, this.item).withPeriode(this.periode);
            case 'technique':
                return new Technique(this.actor, this.item).withPeriode(this.periode);
            case 'tekhne':
                return new Tekhne(this.actor, this.item).withPeriode(this.periode);
            case 'vecu':
                return new Vecu(this.actor, this.item, this.scope).withPeriode(this.periode).withManoeuver(this.manoeuver).withEvent(this.event);
            default:
                if (this.ka != null) {
                    return new Ka(this.actor, this.ka, this.scope);
                }
                if (this.noyau != null) {
                    return new Noyau(this.actor);
                }
                if (this.pavane != null) {
                    return new Pavane(this.actor);
                }
                return null;
        }

    }

}