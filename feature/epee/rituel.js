import { AbstractFocus } from "../core/abstractFocus.js";
import { Version } from "../../module/common/version.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";

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
        const ka = this.actor.getKa('soleil');
        if (ka < 1) {
            return -115;
        }

        const savoir = this.actor.savoir("epee").degre;
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