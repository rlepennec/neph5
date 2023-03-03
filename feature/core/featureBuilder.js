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
     * @param type The type of feature to create.
     * @param item The item of the feature.
     * @returns the new feature. 
     */
    createFeature(type, item) {
        switch (type) {
            case 'appel':
                return new Appel(this.actor, item, this.periode);
            case 'atlanteide':
                return new Atlanteide(this.actor, item, this.periode);
            case 'chute':
                return new Chute(this.actor, item, this.periode);
            case 'competence':
                return new Competence(this.actor, this.item).withManoeuver(this.manoeuver);
            case 'dracomachie':
                return new Dracomachie(this.actor, item, this.periode);
            case 'formule':
                return new Formule(this.actor, item, this.periode);
            case 'habitus':
                return new Habitus(this.actor, item, this.periode);
            case 'invocation':
                return new Invocation(this.actor, item, this.periode);
            case 'passe':
                return new Passe(this.actor, item, this.periode);
            case 'pratique':
                return new Pratique(this.actor, item, this.periode);
            case 'quete':
                return new Quete(this.actor, item, this.periode);
            case 'rite':
                return new Rite(this.actor, item, this.periode);
            case 'rituel':
                return new Rituel(this.actor, item, this.periode);
            case 'science':
                return new Science(this.actor, item, this.periode);
            case 'savoir':
                return new Savoir(this.actor, item, this.periode);
            case 'sort':
                return new Sort(this.actor, item, this.periode);
            case 'technique':
                return new Technique(this.actor, item, this.periode);
            case 'tekhne':
                return new Tekhne(this.actor, item, this.periode);
            case 'vecu':
                return new Vecu(this.actor, this.item, this.scope).withPeriode(this.periode).withManoeuver(this.manoeuver).withEvent(this.event);
            default:
                return null;
        }
    }

    /**
     * @param item The embedded item from which to create the feature.
     * @returns the new feature. 
     */
    createFromEmbedded(item) {
        switch (item?.type) {

            case 'appel':
            case 'atlanteide':
            case 'dracomachie':
            case 'formule':
            case 'habitus':
            case 'invocation':
            case 'pratique':
            case 'rite':
            case 'rituel':
            case 'sort':
            case 'technique':
            case 'tekhne':
                return this.createFeature(item?.type, item);

            default:
                return null;
        }
    }

    /**
     * @param item The original focus item object.
     */
    async dropOriginal(item) {
        switch (item?.type) {

            case 'appel':
            case 'atlanteide':
            case 'dracomachie':
            case 'formule':
            case 'habitus':
            case 'invocation':
            case 'pratique':
            case 'rite':
            case 'rituel':
            case 'sort':
            case 'technique':
            case 'tekhne':
                return this.createFeature(item?.type, null).dropOriginal(item);

            default:
                return null;
        }
    }

    /**
     * @param item The original item from which to create the feature.
     * @returns the new feature. 
     */
    async createFromOriginal(item) {
        switch (item?.type) {
            case 'chute':
            case 'competence':
            case 'passe':
            case 'quete':
            case 'savoir':
            case 'science':
            case 'vecu':
                return this.createFeature(item?.type, item);
            default:
                return null;
        };
    }

}