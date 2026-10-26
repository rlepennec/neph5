import { Constants } from "../../../../../module/common/constants.js";
import { Incarnations } from "../../../../incarnation/incarnations.js";
import { Version } from "../../../../../module/common/version.js";
import { DocumentIdentifier } from "../../../../../module/common/documentIdentifier.js";
import { NephilimItemSheet } from "../../../../../module/item/nephilimItemSheet.js";
import { Mnemos } from "./mnemos.js";
import { Groupe } from "../../../../groupe/groupe.js";

export class VecuSheet extends NephilimItemSheet {

    /**
     * Le vécu est éditable lorsqu'il est ouverte depuis un acteur.
     * @override
     */
    get editableFromActor() {
        return true;
    }

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-vecu"],
        actions: {
            addMnemos: VecuSheet._onAddMnemos,
            editMnemos: VecuSheet._onEditMnemos,
            deleteMnemos: VecuSheet._onDeleteMnemos
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/vecu/regles/v5/item/vecu.html`,
        }
    }

    /**
     * @override
     */
    async _onRender(context, options) {
        await super._onRender(context, options);
        this.applySkin(Version.data(this.document, this.version).element);
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        const context = {
            ...await super._prepareContext(options),
            context: {
                elements: Constants.ELEMENTS
            }
        };

        // Les compétences affichées : les inactives sont masquées (voir Groupe), mais restent
        // dans le vécu
        const competences = Version.data(this.document, this.version).competences ?? [];
        context.context.competences = competences.filter(sid => Groupe.reference(sid) != null);

        // Ouvert depuis un acteur (item embarqué) : le vécu embarqué ne stocke pas de
        // description propre. Elle est héritée de l'objet original et affichée en
        // lecture seule (le template affiche enrichedDescription sans éditeur quand
        // document.isEmbedded). L'original n'est jamais modifié.
        // L'élément, lui, reste stocké et modifiable sur l'embarqué (propre à l'acteur).
        if (this.document.isEmbedded) {

            // Le degré d'un vécu embarqué est celui de son incarnation ; sa période aussi : le vécu
            // lié ne la recopie pas, elle se lit sur son incarnation.
            const incarnations = new Incarnations(this.document.parent);
            context.data = {
                ...context.data,
                degre: incarnations.degreAcquis(this.document),
                periode: incarnations.porte
                    ? incarnations.periodeDe(incarnations.epoqueDe(this.document))
                    : context.data?.periode
            };

            const original = game.items.find(i => i.type === 'vecu' && i.sid === this.document.sid);
            if (original != null) {
                context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
                    Version.data(original).description,
                    {
                        secrets: this.document.isOwner,
                        relativeTo: this.document
                    }
                );
            }
        }

        return context;
    }

    /**
     * @override
     */
    async _onDelete(event, target) {
        const identifier = new DocumentIdentifier(target);
        const document = identifier.toDocument();
        switch (document.type) {
            case 'competence':
                await this.document.deleteReference(identifier.fsid,
                    Version.data(this.document, this.version).competences,
                    Version.path(this.document, 'competences', this.version));
                break;
        }
    }

    /**
     * This function catches the drop on a periode. The dropped item can be
     *   - a periode
     *   - a competence
     * @param event    The drop event.
     * @param document The document identifier which has been dropped.
     */
	async _onDrop(event, document) {
        event.preventDefault();
        switch (document.type) {
            case "competence":
                await this.document.updateItemRefs(document.system,
                    Version.data(this.document, this.version).competences,
                    Version.path(this.document, 'competences', this.version));
                break;
            case "periode":
                // Seul le vécu du monde porte sa période : celle d'un vécu lié est celle de son
                // incarnation, qui se change par le formulaire d'incarnation.
                if (this.document.isEmbedded) break;
                await this.document.update({
                    [Version.path(this.document, 'periode', this.version)]: document.sid
                });
                break;
        }
    }

    /**
     * Supprime un mnémos de la liste.
     */
    static async _onDeleteMnemos(event, target) {
        if (this.locked) return;
        const index = target.closest('[data-item-id]')?.dataset.itemId;
        const mnemos = foundry.utils.duplicate(Version.data(this.document, this.version).mnemos ?? []);
        mnemos.splice(Number(index), 1);
        await this.document.update({
            [Version.path(this.document, 'mnemos', this.version)]: mnemos
        });
        this.document.sheet.render(true);
    }

    /**
     * Ouvre le dialogue d'ajout d'un mnémos.
     */
    static async _onAddMnemos(event, target) {
        if (this.locked) return;
        new Mnemos(this.document.parent, this.document, null, this.version).render(true);
    }

    /**
     * Ouvre le dialogue d'édition d'un mnémos.
     */
    static async _onEditMnemos(event, target) {
        const index = target.closest('[data-item-id]')?.dataset.itemId;
        new Mnemos(this.document.parent, this.document, Number(index), this.version).render(true);
    }

    /**
     * @override
     */
    async _onSubmit(event, form, formData) {

        // Les champs du vécu appartiennent à la version affichée : les clefs du
        // formulaire portent donc son préfixe, celui-là même que les gabarits ont posé.
        const prefixe = Version.prefix(this.document, this.version);

        // Les compétences se changent par dépôt et par la corbeille : les champs cachés de leur
        // liste ne sont pas enregistrés. Réécrire la liste depuis eux effacerait les compétences
        // inactives, masquées de la fiche (voir Groupe).
        for (const name of Object.keys(formData.object).filter(k => k.startsWith(prefixe + ".competences."))) {
            delete formData.object[name];
        }

        // Les mnémos ne sont plus saisis dans la fiche mais dans leur propre dialogue :
        // aucun champ du formulaire ne les porte. La boucle qui les relisait ici les
        // réécrivait donc vides à chaque enregistrement — elle est retirée.

        // Update object
        await this.document.update(formData.object);
    }

}