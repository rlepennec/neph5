import { AbstractFocus } from "../core/abstractFocus.js";
import { Version } from "../../module/common/version.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Science } from "../science/science.js";

export class Sort extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return "Jet de Sort";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPHILIM.tenteSelfSort';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Sort', this.degre)
            .withBlessures('magique')
            .withMetamorphe(this.actor.metamorphe.visibles)
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
     * @Override
     */
    async _createEmbeddedItem(previous) {

        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a sort")
            .withDeleteExisting()
            .withData("focus", (previous == null ? false : Version.data(previous).focus))
            .withData("status", (previous == null ? Constants.CONNU : Version.data(previous).status))
            .withData("periode", this.periode)
            .withoutData('description', 'cercle', 'element', 'voies', 'degre', 'portee', 'duree')
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
     * @Override
     */
    extraChatSentence(fumble, fail, critical, margin) {
        if (fumble === true) {
            return game.i18n.localize('NEPHILIM.fumbleSort');
        }
        if (critical === true) {
            return game.i18n.localize('NEPHILIM.criticalSort');
        }
        return null;
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
        const science = Science.scienceOf(this.actor, Version.data(this.item).cercle).degre;
        if (science === 0) {
            return -103;
        }

        // Retrieve the degre of the focus to cast
        const focus = Version.data(this.item).degre;

        // The sort needs the actor to follow a voie
        if (Version.data(this.item).voies?.length > 0 &&
            Version.data(this.item).voies.includes(this.actor.voieMagique?.sid) === false) {
            if ( Math.ceil(focus/2) >= Math.ceil(science/2) ) {
                return -104;
            }
        }

        // Retrieve the degre of the ka used to cast the focus
        let ka = 0;
        if (Version.data(this.item).element !== 'choix') {
            ka = this.actor.getKa(Version.data(this.item).element === "luneNoire" ? "noyau" : Version.data(this.item).element);
            if (ka === 0) {
                return -105;
            }
        }

        return science + ka - focus;

    }

}