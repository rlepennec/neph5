import { DragDropMixin } from "./dragDropMixin.js";
import { DocumentIdentifier } from "./documentIdentifier.js";
import { Version } from "./version.js";
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
				version: NephilimSheet._onVersion
			},
			window: {
				resizable: true,
			}
		}

		get lockable() {
			return this.isEditable;
		}

		/**
		 * La version des règles affichée par cette fenêtre.
		 *
		 * C'est un état de la FICHE, comme le cadenas : deux fenêtres ouvertes sur le même
		 * document peuvent montrer deux éditions, et rien n'est écrit dans le document.
		 * La valeur est résolue au premier accès et non à la construction, car le réglage
		 * du monde n'existe pas encore quand les classes sont chargées.
		 */
		#version = null;

		get version() {
			return this.#version ??= Version.world;
		}

		/**
		 * @override
		 * Le bouton de version, à côté du cadenas. Il n'apparaît que sur les documents qui
		 * portent réellement plusieurs versions : les types pas encore portés n'en ont pas,
		 * et rien ne change pour eux.
		 */
		async _renderFrame(options) {
			const frame = await super._renderFrame(options);
			const versions = Version.of(this.document);
			if (versions.length > 1) {
				const label = game.i18n.localize('NEPHILIM.' + this.version);
				this.window.controls.insertAdjacentHTML("beforebegin",
					`<button type="button" class="header-control fa-solid fa-book icon" data-action="version"`
					+ ` data-tooltip="${label}" aria-label="${label}"></button>`);
				this.window.version = frame.querySelector("button[data-action=version]");
			}
			return frame;
		}

		/**
		 * Passe à la version suivante, et revient à la première après la dernière.
		 */
		static async _onVersion(event, target) {
			const versions = Version.of(this.document);
			if (versions.length < 2) return;
			const suivante = versions[(versions.indexOf(this.version) + 1) % versions.length];
			const label = game.i18n.localize('NEPHILIM.' + suivante);

			// Le cadre n'est pas reconstruit par un rendu : l'infobulle est mise à jour ici.
			if (this.window.version != null) {
				this.window.version.dataset.tooltip = label;
				this.window.version.setAttribute("aria-label", label);
			}
			this.setVersion(suivante);
		}

		/**
		 * @param value The version to display.
		 */
		setVersion(value) {
			if (this.version !== value) {
				this.#version = value;
				this.render(true);
			}
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
		 * @override
		 */
		async _prepareContext(options) {
			const context = await super._prepareContext(options);
			context.isGM = game.user.isGM;
        	context.debug = game.settings.get('neph5e', 'debug');
			context.editable = this.isEditable && !this.locked;

			// Les données de la version affichée, et le préfixe pour y écrire. Les deux
			// valent quelle que soit la forme du document — ancienne, à plat, ou nouvelle,
			// rangée par version — ce qui laisse cohabiter les types portés et les autres.
			// Un gabarit lit {{data.element}} et écrit name="{{versionPath}}.element".
			context.version = this.version;
			context.versions = Version.of(this.document);
			context.data = Version.data(this.document, this.version);
			context.versionPath = Version.prefix(this.document, this.version);

			context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
				context.data.description,
				{
					secrets: this.document.isOwner,
					relativeTo: this.document
				}
			)
            context.system = this.document.system;
			return context;
		}

		/**
		 * Fiche verrouillée ou non modifiable : les champs texte sont en lecture seule
		 * plutôt que désactivés. On peut cliquer dedans, sélectionner le texte et le faire
		 * défiler, sans pouvoir le modifier. Ils sont marqués data-verrouille, ce qui leur
		 * garde l'apparence d'un champ désactivé (voir le LESS) et les retire des données
		 * enregistrées (voir _onSubmit), comme l'étaient les champs désactivés.
		 * @override
		 */
		async _onRender(context, options) {
			await super._onRender(context, options);
			if (this.locked !== true && this.isEditable === true) {
				return;
			}
			for (const field of this.element.querySelectorAll('input:disabled:is([type="text"], :not([type]))')) {
				field.disabled = false;
				field.readOnly = true;
				field.dataset.verrouille = "";
			}
		}

		static async _onSubmit(event, form, formData) {
			// Les champs verrouillés en lecture seule ne sont pas enregistrés (voir _onRender)
			for (const field of form.querySelectorAll('[data-verrouille]')) {
				delete formData.object[field.name];
			}
			await this._onSubmit(event, form, formData);
		}

		async _onSubmit(event, form, formData) {
			await this.document.update(formData.object);
		}

	}

}