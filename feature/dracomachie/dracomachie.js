import { AbstractFocus } from "../core/abstractFocus.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Science } from "../science/science.js";

export class Dracomachie extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return "Jet de dracomachie";
    }

    /**
     * @Override
     */
    get sentence() {
        switch (this.domaine) {
            case 'charmes':
                return 'NEPH5E.tente.self.dracomachie.charmes';
            case 'rites':
                return 'NEPH5E.tente.self.dracomachie.rites';
            case 'passes':
                return 'NEPH5E.tente.self.dracomachie.passes';
        }
    }

    /**
     * @Override
     */
    get data() {

        switch (this.domaine) {

            case 'charmes':
                return new ActionDataBuilder(this)
                    .withType(Constants.SIMPLE)
                    .withItem(this.item)
                    .withElement(this.element)
                    .withOpposition("effetDragon")
                    .withConditions(["lienAnalogiqueAvec", "lienAnalogiqueSans"])
                    .withBase('Charme', this.degre)
                    .withBlessures('magique')
                    .export();

            case 'rites':
                return new ActionDataBuilder(this)
                    .withType(Constants.SIMPLE)
                    .withItem(this.item)
                    .withElement(this.element)
                    .withBase('Rite', this.degre)
                    .withBlessures('magique')
                    .export();

            case 'passes':
                return new ActionDataBuilder(this)
                    .withType(Constants.SIMPLE)
                    .withItem(this.item)
                    .withElement(this.element)
                    .withOpposition("effetDragon")
                    .withBase('Passe', this.degre)
                    .withBlessures('magique')
                    .withNote(this.contraint(5))
                    .export();

        }

    }

    /**
     * @return -100 if uncastable, the value otherwise
     */
    get rawDegre() {

        // Retrieve the degre of the cercle used to cast the focus
        const science = Science.scienceOf(this.actor, this.item.system.cercle).degre;
        if (science === 0) {
            return -112;
        }

        switch (this.domaine) {
            case 'charmes':
                 return science;
            case 'rites':
                return science;
            case 'passes':
                const focus = this.item.system.degre;
                return science - (focus == null ? 0 : focus);
            default:
                return -100;
        }

    }

    /**
     * @Override
     */
    note(parameters) {
        return this.contraint(parameters?.opposition);
    }

    /**
     * @Override
     */
    async _createEmbeddedItem(previous) {
        
        // Create a new focus or move the focus to the new periode.
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a passe")
            .withDeleteExisting()
            .withData("periode", this.periode)
            .withoutData('description', 'cercle', 'degre')
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
    modifier(parameters) {
        switch (this.domaine) {
            case 'charmes': {
                const condition = this.condition(parameters);
                const ka = parameters == null ? this.actor.getKa('air') : parameters.ka;
                const menace = parameters?.opposition == null ? 50 : parameters.opposition * 10;
                return ka - menace - condition;
            }
            case 'passes': {
                const ka = parameters == null ? this.actor.getKa('air') : parameters.ka;
                const menace = parameters?.opposition == null ? 50 : parameters.opposition * 10;
                return ka - menace;
            }
            default:
                return 0;
        }
    }

    /**
     * @Override
     */
    condition(parameters) {
        switch (this.domaine) {
            case 'charmes': {
                if (parameters?.condition === 'lienAnalogiqueSans') {
                    return parameters?.opposition == null ? 50 : parameters.opposition * 10;
                } else {
                    return 0;
                }
            }
            default:
                return 0;
        }
    }

    /**
     * 
     */
    get domaine() {
        const science = Science.scienceOf(this.actor, this.item.system.cercle);
        return science.item.system.key.replace("dracomachie@","");
    }

    /**
     * 
     */
    get element() {
        switch (this.domaine) {
            case 'charmes':
                return null;
            case 'rites':
                return null;;
            case 'passes':
                return 'choix';
            default:
                return null;;
        }
    }

    contraint(menace) {
        const science = Science.scienceOf(this.actor, this.item.system.cercle);
        const contraint = menace <= this.actor.ka && menace <= science.degre;
        return contraint ? "L'effet dragon est contraint automatiquement" : "L'effet dragon n'est pas contraint automatiquement";
    }

}