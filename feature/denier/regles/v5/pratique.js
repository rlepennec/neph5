import { AbstractFocus } from "../../../core/regles/v5/abstractFocus.js";
import { Version } from "../../../../module/common/version.js";
import { ActionDataBuilder } from "../../../core/regles/v5/actionDataBuilder.js";
import { Constants } from "../../../../module/common/regles/v5/constants.js";

export class Pratique extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return "Jet de Pratique Synarque";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPHILIM.tenteSelfPratique';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Pratique', this.degre)
            .withBlessures('magique')
            .withAide("participants")
            .export();
    }

    /**
     * @Override
     */
    get rawDegre() {

        // Retrieve the degre of the ka used to cast the focus
        const ka = this.actor.regles.ka;
        if (ka < 1) {
            return -105;
        }

        const savoir = this.actor.regles.savoir("denier").degre;
        if (savoir < 1) {
            return -119;
        }

        // Retrieve the degre of the focus to cast
        const focus = Version.data(this.item).degre;

        return savoir + ka - focus;

    }


    /**
     * @Override
     */
    modifier(parameters) {
        return parameters?.aide == null ? 0 : parameters.aide * 10;
    }

    /**
     * @Override
     */
    getEmbeddedData() {
        return {
            difficulty: this.degre
        }
    }

}