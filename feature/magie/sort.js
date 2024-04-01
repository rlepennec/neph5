import { AbstractFocus } from "../core/abstractFocus.js";
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
        return 'NEPH5E.tente.self.sort';
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
        if (this.item.system.element === 'choix') {
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
            .withData("focus", (previous == null ? false : previous.system.focus))
            .withData("status", (previous == null ? Constants.CONNU : previous.system.status))
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
            return game.i18n.localize('NEPH5E.fumbleSort');
        }
        if (critical === true) {
            return game.i18n.localize('NEPH5E.criticalSort');
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

        if (this.embedded.system.status === 'connu') {
            return -101;
        }

        if (this.embedded.system.focus !== true && this.embedded.system.status === 'dechiffre') {
            return -102;
        }

        // Retrieve the degre of the cercle used to cast the focus
        const science = Science.scienceOf(this.actor, this.item.system.cercle).degre;
        if (science === 0) {
            return -103;
        }

        // Retrieve the degre of the focus to cast
        const focus = this.item.system.degre;

        // The sort needs the actor to follow a voie
        if (this.item.system?.voies.length > 0 &&
            this.item.system.voies.includes(this.actor.voieMagique?.sid) === false) {
            if ( Math.ceil(focus/2) >= Math.ceil(science/2) ) {
                return -104;
            }
        }

        // Retrieve the degre of the ka used to cast the focus
        let ka = 0;
        if (this.item.system.element !== 'choix') {
            ka = this.actor.getKa(this.item.system.element === "luneNoire" ? "noyau" : this.item.system.element);
            if (ka === 0) {
                return -105;
            }
        }

        return science + ka - focus;

    }

}