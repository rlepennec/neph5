import { AbstractFocus } from "../core/abstractFocus.js";
import { Version } from "../../module/common/version.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Science } from "../science/science.js";

export class Invocation extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return this.pacte ? game.i18n.localize('NEPHILIM.jetInvocation') : game.i18n.localize('NEPHILIM.jetPacte');
    }

    /**
     * @Override
     */
    get sentence() {
        return this.pacte ? 'NEPHILIM.tenteSelfInvocation' : 'NEPHILIM.tenteSelfPacte';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(this.pacte ? Constants.SIMPLE : Constants.OPPOSED)
            .withItem(this.item)
            .withBase('Invocation', this.degre)
            .withBlessures('magique')
            .export();
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
        return Version.data(this.embedded).pacte;
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