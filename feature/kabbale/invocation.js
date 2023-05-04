import { AbstractFocus } from "../core/abstractFocus.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Science } from "../science/science.js";

export class Invocation extends AbstractFocus {

    /**
     * @Override
     */
    async initializeRoll() {

        if (this.embedded == null || this.embedded.system.focus !== true && this.embedded.system.status === 'dechiffre') {
            ui.notifications.warn("Vous ne possédez pas le focus de cette invocation");
            return;
        }

        return await super.initializeRoll();

    }

    /**
     * @Override
     */
    get title() {
        return this.pacte ? game.i18n.localize('NEPH5E.jetInvocation') : game.i18n.localize('NEPH5E.jetPacte');
    }

    /**
     * @Override
     */
    get sentence() {
        return this.pacte ? 'NEPH5E.tente.self.invocation' : 'NEPH5E.tente.self.pacte';
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
    get degre() {

        // Retrieve the degre of the cercle used to cast the focus
        const science = Science.scienceOf(this.actor, this.item.system.sephirah).degre;

        // Retrieve the degre of the ka used to cast the focus
        const ka = this.item.system.element === 'choix' ? 0 : this.actor.getKa(this.item.system.element);

        // Final result
        return science + ka;

    }

    /**
     * @Override
     */
    modifier(parameters) {
        return parameters == null ? this.actor.getKa('air') : parameters.ka;
    }

    /**
     * @returns true if a pacte has already be done.
     */
    get pacte() {
        return this.embedded.system.pacte;
    }

    /**
     * @Override
     */
    async _createEmbeddedItem(previous) {

        // Create a new focus or move the focus to the new periode.
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a sort")
            .withDeleteExisting()
            .withData("focus", (previous == null ? false : previous.system.focus))
            .withData("status", (previous == null ? Constants.DECHIFFRE : previous.system.status))
            .withData("pacte", (previous == null ? false : previous.system.pacte))
            .withData("periode", this.periode)
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

}