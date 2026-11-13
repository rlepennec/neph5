import { AbstractFocus } from "../../../core/regles/v5/abstractFocus.js";
import { Version } from "../../../../module/common/version.js";
import { ActionDataBuilder } from "../../../core/regles/v5/actionDataBuilder.js";
import { Constants } from "../../../../module/common/regles/v5/constants.js";

export class Rituel extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return "Jet de Rituel Myste";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPHILIM.tenteSelfRituel';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Rituel', this.degre)
            .withBlessures('magique')
            .export();
    }

    /**
     * @Override
     */
    get rawDegre() {

        // Retrieve the degre of the ka used to cast the focus
        const ka = this.actor.regles.getKa('soleil');
        if (ka < 1) {
            return -115;
        }

        const savoir = this.actor.regles.savoir("epee").degre;
        if (savoir < 1) {
            return -118;
        }

        // Retrieve the degre of the focus to cast
        const focus = Version.data(this.item).degre;

        return savoir + ka - focus;

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