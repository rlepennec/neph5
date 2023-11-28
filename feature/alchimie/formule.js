import { AbstractFocus } from "../core/abstractFocus.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Science } from "../science/science.js";

export class Formule extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return 'Jet de Formule';
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.formule';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Formule', this.degre)
            .withBlessures('magique')
            .export();
    }

    /**
     * @Override
     */
    async initializeRoll() {

        if (this.embedded == null || (this.embedded.system.focus !== true && (this.embedded.system.status === 'connu' || this.embedded.system.status === 'dechiffre'))) {
            ui.notifications.warn("Vous ne possédez pas le focus de cette formule");
            return;
        }

        const owner = this.getOwner();
        const construct = owner == null ? null : owner.getConstruct(this.item.system.substance);

        if (construct?.active !== true) {
            ui.notifications.warn("Vous ne possédez pas de construct actif");
            return;
        }

        if (construct.degre === "oeuvreAuNoir" && (this.item.system.cercle === "oeuvreAuBlanc" || this.item.system.cercle === "oeuvreAuRouge")) {
            ui.notifications.warn("Vous ne possédez pas de construct au niveau requis");
            return;
        }

        if (construct.degre === "oeuvreAuBlanc" && this.item.system.cercle === "oeuvreAuRouge") {
            ui.notifications.warn("Vous ne possédez pas de construct au niveau requis");
            return;
        }

        for (let element of this.item.system.elements) {

            switch (element) {
                case 'air':
                case 'eau':
                case 'feu':
                case 'lune':
                case 'terre':
                    if (this.actor.system.alchimie.primae[element].quantite < this.item.system.degre) {
                        ui.notifications.warn("Vous ne possédez pas les materiae primae necessaires");
                        return;
                    }
                    break;

                case 'quintuple':
                    if (this.actor.system.alchimie.primae['air'].quantite < 5 &&
                        this.actor.system.alchimie.primae['eau'].quantite < 5 &&
                        this.actor.system.alchimie.primae['feu'].quantite < 5 &&
                        this.actor.system.alchimie.primae['lune'].quantite < 5 &&
                        this.actor.system.alchimie.primae['terre'].quantite < 5) {
                   ui.notifications.warn("Vous ne possédez pas les materiae primae necessaires");
                   return;
               }
                    break;

                case 'quintessence':
                    if (this.actor.system.alchimie.primae['air'].quantite < 1 ||
                        this.actor.system.alchimie.primae['eau'].quantite < 1 ||
                        this.actor.system.alchimie.primae['feu'].quantite < 1 ||
                        this.actor.system.alchimie.primae['lune'].quantite < 1 ||
                        this.actor.system.alchimie.primae['terre'].quantite < 1) {
                        ui.notifications.warn("Vous ne possédez pas les materiae primae necessaires");
                        return;
                    }
                    break;
                
            }

        }

        return await super.initializeRoll();

    }

    /**
     * @Override
     */
    async finalize(result) {

        if (this.actor.system.options.gestionLaboratoire != true) {
            return;
        }

        // If success, produce 1 dose
        if (result.success === true) {
            const quantite = this.embedded.system.quantite + 1;
            await this.embedded.update({ ['system.quantite']: quantite });

            // If not critical, spend materiae primae
            if (result.critical === false) {
                for (let element of this.item.system.elements) {
                    const quantite = Math.max(0, this.actor.system.alchimie.primae[element].quantite - this.item.system.degre);
                    await this.actor.update({ ['system.alchimie.primae.' + element + ".quantite"]: quantite });
                }
            }

        }

    }

    /**
     * @Override
     */
    get degre() {

        // Retrieve the construct used to cast focus according to the current laboratory
        // The construct must be active
        const owner = this.getOwner();
        const construct = owner == null ? null : owner.getConstruct(this.item.system.substance);
        if (construct?.active !== true) {
            return null;
        }

        // Retrieve all elements used to cast the focus
        // All elements must be owned by the construct
        let ka = 0;
        switch (this.item.system.cercle) {
            case 'oeuvreAuNoir':
                ka = construct[this.item.system.elements[0]] ?? 0
                if (ka < 1) {
                    return null;
                }
                break;
            case 'oeuvreAuBlanc':
                ka = Math.min(construct[this.item.system.elements[0]] ?? 0, construct[this.item.system.elements[1]] ?? 0);
                if (ka < 1) {
                    return null;
                }
                break;
            case 'oeuvreAuRouge':
                switch (this.item.system.elements[0]) {
                    case 'quintessence':
                        Math.min(construct['air'], construct['eau'], construct['feu'], construct['lune'], construct['terre']);
                        break;
                    case 'quintuple':
                        ka = 0;
                        break;
                }
                break;
        }


        // The cercle of the formule must be supported by the construct
        switch (this.item.system.cercle) {
            case 'oeuvreAuNoir':
                break;
            case 'oeuvreAuBlanc':
                if (construct.degre === 'oeuvreAuNoir') {
                    return null;
                }
                break;
            case 'oeuvreAuRouge':
                if (construct.degre === 'oeuvreAuNoir' || construct.degre === 'oeuvreAuBlanc') {
                    return null;
                }
                break;
        }

        // Retrieve the degre of the cercle used to cast the focus
        const science = Science.scienceOf(this.actor, this.item.system.cercle).degre;

        // Retrieve the degre of the focus to cast
        const focus = this.item.system.degre;

        // Final result
        return Math.max(0, science + ka - focus);

    }

    /**
     * @Override
     */
    modifier(parameters) {
        if (this.item.system.elements[0] === 'quintuple') {
            const substance = this.item.system.substance;
            const construct = this.actor.getConstruct(substance);
            if (parameters == null || parameters.elt == null) {
                if (this.actor.system.alchimie.primae.air.quantite > 4) {
                    return construct['air'] * 10;
                } else if (this.actor.system.alchimie.primae.eau.quantite > 4) {
                    return construct['eau'] * 10;
                } else if (this.actor.system.alchimie.primae.feu.quantite > 4) {
                    return construct['feu'] * 10;
                } else if (this.actor.system.alchimie.primae.lune.quantite > 4) {
                    return construct['lune'] * 10;
                } else if (this.actor.system.alchimie.primae.terre.quantite > 4) {
                    return construct['terre'] * 10;
                } else {
                    return 0;
                }
            } else {
                return construct[parameters.elt] * 10;
            }
        } else {
            return 0;
        }
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
            .withData("status", (previous == null ? Constants.CONNU : previous.system.status))
            .withData("quantite", 0)
            .withData("transporte", 0)
            .withData("periode", this.periode)
            .withoutData('description', 'degre', 'cercle', 'enonce', 'substance', 'elements', 'aire', 'duree', 'catalyseurs', 'variantes')
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
     * @returns the owner actor of the used laboratory.
     */
    getOwner() {
        if (this.actor.type === 'figure') {
            const sid = this.actor.system.alchimie.courant;
            return sid == null ? this.actor : game.actors.find(i => i.sid === sid);
        } else {
            return null;
        }
    }

}