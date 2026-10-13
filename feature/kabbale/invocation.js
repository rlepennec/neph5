import { AbstractFocus } from "../core/abstractFocus.js";
import { Version } from "../../module/common/version.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Pacte } from "./pacte.js";
import { Science } from "../science/science.js";

/**
 * Invoquer une créature de kabbale. Avec un pacte, un jet simple suffit. Sans pacte, deux
 * temps : le jet d'invocation, simple, puis, s'il réussit, le jet de pacte, opposé à la
 * créature (voir Pacte). Un pacte manqué coûte autant de dommages magiques que le degré de la
 * créature. Le dernier jet porte seul la conclusion.
 */
export class Invocation extends AbstractFocus {

    /**
     * Le second temps d'une invocation sans pacte : nouer le pacte avec la créature invoquée.
     * @returns the instance.
     */
    withNouer() {
        this.nouer = true;
        return this;
    }

    /**
     * @Override
     */
    get title() {
        return this.nouer === true ? game.i18n.localize('NEPHILIM.jetPacte') : game.i18n.localize('NEPHILIM.jetInvocation');
    }

    /**
     * @Override
     */
    get sentence() {
        return this.nouer === true ? 'NEPHILIM.tenteSelfPacte' : 'NEPHILIM.tenteSelfInvocation';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(this.nouer === true ? Constants.OPPOSED : Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Invocation', this.degre)
            .withBlessures('magique')
            .export();
    }

    /**
     * Sans pacte, un échec conclut l'invocation : sa phrase devient le résultat du jet.
     * @Override
     */
    async apply(result) {
        if (this.pacte !== true && result.success !== true) {
            result.sentence = this.nouer === true
                ? Pacte.echec(this.item.name)
                : "ne parvient pas à invoquer " + this.item.name;
        }
        await super.apply(result);
    }

    /**
     * Sans pacte : une invocation réussie ouvre le jet de pacte ; un jet de pacte raté coûte
     * les dommages du pacte manqué. Un jet de pacte réussi passe la main à la créature, qui
     * s'y oppose (voir OpposedRollBuilder et Pacte).
     * @Override
     */
    async finalize(result) {
        if (this.pacte === true) {
            return;
        }
        if (this.nouer !== true && result.success === true) {
            await new Invocation(this.actor).withItem(this.item).withNouer().initializeRoll();
        } else if (this.nouer === true && result.success !== true) {
            await Pacte.subir(this.actor, this.item);
        }
    }

    /**
     * @Override
     */
    modifier(parameters) {
        if (Version.data(this.item).element === 'choix') {
            return parameters == null ? this.actor.getKa('air') : parameters.ka;
        } else {
            return 0;
        }
    }

    /**
     * @returns true if a pacte has already be done.
     */
    get pacte() {
        return Version.data(this.embedded).pacte === true;
    }

    /**
     * @Override
     */
    async _createEmbeddedItem(previous) {

        // Create a new focus or move the focus to the new periode.
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a sort")
            .withDeleteExisting()
            .withData("focus", (previous == null ? false : Version.data(previous).focus))
            .withData("status", (previous == null ? Constants.CONNU : Version.data(previous).status))
            .withData("pacte", (previous == null ? false : Version.data(previous).pacte))
            .withIncarnation(this.periode)
            .withoutData('description', 'sephirah', 'monde', 'element', 'degre', 'portee', 'duree', 'visibilite')
            .create();

    }

    /**
     * @Override
     */
    getEmbeddedData() {
        return {
            difficulty: this.degre
        }
    }

    /**
     * @return -100 if uncastable, the value otherwise
     */
    get rawDegre() {

        if (this.embedded == null) {
            return -100;
        }

        if (Version.data(this.embedded).status === 'connu') {
            return -101;
        }

        if (Version.data(this.embedded).focus !== true && Version.data(this.embedded).status === 'dechiffre') {
            return -102;
        }

        // Retrieve the degre of the cercle used to cast the focus
        const science = Science.scienceOf(this.actor, Version.data(this.item).sephirah).degre;
        if (science === 0) {
            return -106;
        }

        // Retrieve the degre of the ka used to cast the focus
        let ka = 0;
        if (Version.data(this.item).element !== 'choix') {
            ka = this.actor.getKa(Version.data(this.item).element === "luneNoire" ? "noyau" : Version.data(this.item).element);
            if (ka === 0) {
                return -105;
            }
        }

        return science + ka;

    }

}