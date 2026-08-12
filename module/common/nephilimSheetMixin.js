import { DragDropMixin } from "./dragDropMixin.js";
import { DocumentIdentifier } from "./documentIdentifier.js";
import { LockableMixin } from "./lockableMixin.js";
import { SetupableMixin } from "./setupableMixin.js";
import { TabsMixin } from "./tabsMixin.js";

export const NephilimMixinSheet = Base => {

	return class NephilimSheet extends DragDropMixin(TabsMixin(SetupableMixin(LockableMixin(foundry.applications.api.HandlebarsApplicationMixin(Base))))) {

		static DEFAULT_OPTIONS = {
			classes: ["nephilim", "sheet"],
			form: {
				closeOnSubmit: false,
				submitOnChange: true,
				handler: NephilimSheet._onSubmit,
			},
			editable: true,
			tag: "form",
			actions: {
				delete: NephilimSheet._onDelete,
				open: NephilimSheet._onOpenLink,
				select: NephilimSheet._onSelect,
				exit: NephilimSheet._onExit
			},
			window: {
				resizable: true,
			}
		}

		get lockable() {
			return this.isEditable;
		}

		/**
		 * Indique qu'un type d'objet est éditable lorsque sa fiche est ouverte
		 * depuis un acteur (contexte embarqué). Par défaut faux ; les fiches concrètes
		 * le surchargent (ex. CompetenceSheet) pour l'activer. Quand c'est faux, la
		 * fiche ouverte depuis un acteur est en lecture seule et ne montre pas le cadenas.
		 * @returns {boolean}
		 */
		get editableFromActor() {
			return false;
		}

		/**
		 * @returns {boolean} true si la fiche a été ouverte depuis un acteur, c.-à-d.
		 * avec des données embarquées (embeddedData non vide, posé par withEmbeddedData).
		 */
		get openedFromActor() {
			return this.embeddedData != null && Object.keys(this.embeddedData).length > 0;
		}

		/**
		 * @override
		 * Un type "editableFromActor" est en lecture seule quand sa fiche est ouverte
		 * depuis un acteur. Comme le cadenas, context.editable, la désactivation du
		 * formulaire et le drag & drop dérivent tous d'isEditable, ce seul point suffit.
		 */
		get isEditable() {
			if (!this.editableFromActor && this.openedFromActor) {
				return false;
			}
			return super.isEditable;
		}

		/**
		 * The callback used to open a link.
		 * @param {*} event 
		 * @param {*} target 
		 */
		static async _onOpenLink(event, target) {
			await this._onOpenLink(event, target);
		}

		async _onOpenLink(event, target) {
			new DocumentIdentifier(target).toDocument().sheet.render(true);
		}

		static async _onSelect(event, target) {
			this._onSelect(event, target)
		}

		/**
		 * The callback used to delete a referenced document from the current one.
		 * @param {*} event 
		 * @param {*} target 
		 */
		static async _onDelete(event, target) {
			if (this.locked) return;
        	const document = new DocumentIdentifier(target).toDocument();
			await this._onDelete(event, document);
		}

		async _onDelete(event, document) {
			const handler = this.options.deleteHandlers[document.type];
			if (handler) {
				return handler.call(this, event, document);
			}
		}

		/**
		 * The callback used to select an element which must be overriden.
		 * @param {*} event  The select event
		 * @param {*} target The selected HTML target
		 * @protected
		 */
		async _onSelect(event, target) {
			throw new Error("_onSelect method must be implemented");
		}

		static async _onExit(event, target) {
			this._onExit(event, target)
		}

		async _onExit(event, target) {
			throw new Error("_onExit method must be implemented");
		}

		/** 
		 * @override
		 */
		async _prepareContext(options) {
			const context = await super._prepareContext(options);
			context.isGM = game.user.isGM;
        	context.debug = game.settings.get('neph5e', 'debug');
			context.editable = this.isEditable && !this.locked;
			context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
				this.document.system.description,
				{
					secrets: this.document.isOwner,
					relativeTo: this.document
				}
			)
            context.system = this.document.system;
			return context;
		}

		static async _onSubmit(event, form, formData) {
			await this._onSubmit(event, form, formData);
		}

		async _onSubmit(event, form, formData) {
			await this.document.update(formData.object);
		}

	}

}