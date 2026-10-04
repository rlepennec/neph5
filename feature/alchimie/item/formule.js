import { Constants } from "../../../module/common/constants.js";
import { Version } from "../../../module/common/version.js";
import { DocumentIdentifier } from "../../../module/common/documentIdentifier.js";
import { FormuleDataModel } from "./formule.mjs";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class FormuleSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-formule"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/alchimie/item/formule.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                elements: Constants.ELEMENTS,
                elementsGS: Constants.ELEMENTS_GRAND_OEUVRE,
                cercles: super.cerclesOf('alchimie'),
                substances: FormuleDataModel.defineSchema().versions.fields.v5.fields.substance.choices,
                catalyseurs: game.settings.get('neph5e', 'catalyseurs')
            }
        }
    }

    /**
     * L'énoncé reste consultable quand la fiche est verrouillée ou non modifiable : en
     * lecture seule plutôt que désactivé, on peut cliquer dans le champ et faire défiler
     * le texte. Son nom porte le préfixe de la version affichée.
     * @override
     */
    async _onRender(context, options) {
        await super._onRender(context, options);
        const nom = Version.path(this.document, 'enonce', this.version);
        const enonce = this.element.querySelector('input[name="' + nom + '"]');
        if (enonce?.disabled === true) {
            enonce.disabled = false;
            enonce.readOnly = true;
        }
    }

    /**
     * @override
     */
    async _onDelete(event, target) {
        const identifier = new DocumentIdentifier(target);
        const document = identifier.toDocument();
        switch (document.type) {
            case 'formule':
                await this.document.deleteReference(identifier.fsid, Version.data(this.document, this.version).variantes, Version.path(this.document, 'variantes', this.version));
                await document.deleteReference(new DocumentIdentifier(this.document).fsid, Version.data(document).variantes, Version.path(document, 'variantes'));
                break;
            case "catalyseur":
                await this.document.deleteReference(identifier.fsid, Version.data(this.document, this.version).catalyseurs, Version.path(this.document, 'catalyseurs', this.version));
                break;
        }
    }

    /**
     * This function catches the drop on an formule. It can be
     *   - an other formule, that is a variante
     *   - a catalyseur
     * @param event The drop event.
     */
	async _onDrop(event, document) {
        event.preventDefault();
        switch (document.type) {
            case "formule":
                await this.document.updateItemRefs(document.system, Version.data(this.document, this.version).variantes, Version.path(this.document, 'variantes', this.version));
                await document.updateItemRefs(this.document.system, Version.data(document).variantes, Version.path(document, 'variantes'));
                break;
            case "catalyseur":
                await this.document.updateItemRefs(document.system, Version.data(this.document, this.version).catalyseurs, Version.path(this.document, 'catalyseurs', this.version));
                break;
        }
    }

    /**
     * @override
     */
    async _onSubmit(event, form, formData) {

        // Les champs de la formule appartiennent à la version affichée : les clefs du
        // formulaire portent son préfixe, celui-là même que le gabarit a posé.
        const data = Version.data(this.document, this.version);
        const prefixe = Version.prefix(this.document, this.version);

        // Update elements
        const fst = formData.object[prefixe + ".elements.[0]"];
        const elements = fst == null ? data.elements : [];
        if (fst != null) {
            const snd = formData.object[prefixe + ".elements.[1]"];
            elements.push(fst);
            delete formData.object[prefixe + ".elements.[0]"];
            if (formData.object[prefixe + ".cercle"] === "oeuvreAuBlanc") {
                // Le second menu n'est rendu que si le cercle valait DÉJÀ
                // oeuvreAuBlanc. En basculant vers ce cercle, le champ est
                // absent du formulaire et snd vaut undefined : sans cette
                // garde on empilait undefined dans elements. Le second élément
                // se saisit au rendu suivant, une fois le menu affiché.
                if (snd != null) elements.push(snd);
                delete formData.object[prefixe + ".elements.[1]"];
            }
        }
        formData.object[prefixe + ".elements"] = elements;

        // Update catalyseurs
        let size = data.catalyseurs == null ? 0 : data.catalyseurs.length;
        const catalyseurs = [];
        for (let index = 0; index < size; index++) {
            const name = prefixe + ".catalyseurs.[" + index + "]";
            catalyseurs.push(formData.object[name]);
            delete formData.object[name];
        }
        formData.object[prefixe + ".catalyseurs"] = catalyseurs;

        // Update variantes
        size = data.variantes == null ? 0 : data.variantes.length;
        const variantes = [];
        for (let index = 0; index < size; index++) {
            const name = prefixe + ".variantes.[" + index + "]";
            variantes.push(formData.object[name]);
            delete formData.object[name];
        }
        formData.object[prefixe + ".variantes"] = variantes;

        // Update echec & maladresse
        if (formData.object[prefixe + ".cercle"] !== "oeuvreAuRouge") {
            formData.object[prefixe + '.echec'] = new foundry.data.operators.ForcedDeletion();
            formData.object[prefixe + '.maladresse'] = new foundry.data.operators.ForcedDeletion();
        }

        // Update object
        await this.document.update(formData.object);

    }

}