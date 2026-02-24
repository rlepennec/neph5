import { DocumentIdentifier } from "./documentIdentifier.js"
import { DocumentReference } from "./documentReference.js"
import { DocumentTools } from "./documentTools.js"
import { VersionSelector } from "./versionSelector.js"

export const NephilimMixinSheet = Base => {

	return class NephilimSheet extends foundry.applications.api.HandlebarsApplicationMixin(Base) {

		static DEFAULT_OPTIONS = {
			classes: ["nephilim", "sheet"],
			form: {
				closeOnSubmit: false,
				submitOnChange: true,
			},
			editable: true,
			tag: "form",
			dragDrop: [
				{ 
					dragSelector: '[data-drag]',
					dropSelector: null
				}
			],
			actions: {
				delete: NephilimSheet._onRemoveReference,
				open: NephilimSheet._onOpenLink,
				lock: NephilimSheet._onLock,
				setup: NephilimSheet._onSetup
			},
			window: {
				resizable: true,
			}
		}

		version = 'v5'; //game.settings.set("neph5e", "worldTemplateVersion", target);

		versions = DocumentTools.getVersions(this.document);

		locked = true;

		#setupable = true;

		#dragDrop = this.#createDragDropHandlers();

		get setupable() {
			return this.#setupable && this.versions.length > 0;
		}

		/**
		 * @param {*} value The system version to set.
		 */
		setVersion(value) {
			if (this.version !== value) {
				this.version = value;
				this.render(true);
			}
		}

		/**
		* Create drag-and-drop workflow handlers for this Application
		* @returns {DragDrop[]}     An array of DragDrop handlers
		* @private
		*/
		#createDragDropHandlers() {
			return this.options.dragDrop.map((d) => {
				d.permissions = {
					dragstart: this._canDragStart.bind(this),
					drop: this._canDragDrop.bind(this),
				};
				d.callbacks = {
					dragstart: this._onDragStart.bind(this),
					dragover: this._onDragOver.bind(this),
					drop: this._onDrop.bind(this),
				};
				return new foundry.applications.ux.DragDrop.implementation(d);
			});
		}

		/**
		 * @param {*} locked The lock state to display.
		 * @returns the class to display the toggle icon.
		 */
		static #getLockIcon(locked) {
			return locked ? 'fa-lock' : 'fa-lock-open';
		}

		// Optional: Add getter to access the private property

		/**
		 * Returns an array of DragDrop instances
		 * @type {DragDrop[]}
		 * @public
		 */
		get dragDrop() {
			return this.#dragDrop;
		}

		/** 
		 * @override
		 */
		async _onClose() {
		}

		// async #testCreateItem() {
		// 	const data = [{name: "New incarnation", type: "incarnation"}];
		// 	const created = await Item.implementation.create(data);
		// 	console.log(created);
		// 	await created.delete();
		// }



		/** 
		 * @override
		 */
		async _renderFrame(options) {

			const frame = await super._renderFrame(options);

			if (this.isEditable) {
				const lockIcon = NephilimSheet.#getLockIcon(this.locked);
				const lockLabel = game.i18n.localize("NEPHILIM.toggleLock");
				const lockId = `<button type="button" class="header-control fa-solid ${lockIcon} icon" data-action="lock" data-tooltip="${lockLabel}" aria-label="${lockLabel}"></button>`;
				this.window.controls.insertAdjacentHTML("beforebegin", lockId);
				this.window.lock = frame.querySelector("button[data-action=lock]");
			}

			if (this.setupable) {
				const lockIcon = 'fa-solid fa-gear';
				const lockLabel = game.i18n.localize("NEPHILIM.setup");
				const lockId = `<button type="button" class="header-control fa-solid ${lockIcon} icon" data-action="setup" data-tooltip="${lockLabel}" aria-label="${lockLabel}"></button>`;
				this.window.controls.insertAdjacentHTML("beforebegin", lockId);
			}

			return frame;

		}

		/** 
		 * @override
		 */
		async _onRender(context, options) {
			this.#dragDrop.forEach((d) => d.bind(this.element));
		}

		/**
		 * Define whether a user is able to begin a dragstart workflow for a given drag selector
		 * @param {string} selector       The candidate HTML selector for dragging
		 * @returns {boolean}             Can the current user drag this selector?
		 * @protected
		 */
		_canDragStart(selector) {
			// game.user fetches the current user
			return this.isEditable;
		}

		/**
		 * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
		 * @param {string} selector       The candidate HTML selector for the drop target
		 * @returns {boolean}             Can the current user drop on this selector?
		 * @protected
		 */
		_canDragDrop(selector) {
			// game.user fetches the current user
			return this.isEditable;
		}

		/**
		 * Callback actions which occur at the beginning of a drag start workflow.
		 * @param {*} event 
		 * @param {*} target 
		 */
		_onDragStart(event) {

			const el = event.currentTarget;
			if ('link' in event.target.dataset) return;

			// Extract the data you need
			let dragData = null;

			if (!dragData) return;

			// Set data transfer
			event.dataTransfer.setData('text/plain', JSON.stringify(dragData));

		}

		/**
		 * Callback actions which occur when a dragged element is over a drop target.
		 * @param {*} event 
		 * @param {*} target 
		 */
		_onDragOver(event) { }

		/**
		 * The callback used to drop an element on a target.
		 * @param {*} event 
		 * @param {*} target 
		 */
		async _onDrop(event) {
			if (this.locked) return;
			const drop = new DocumentIdentifier(event).toDocument();
			if (drop == null) {
				ui.notifications.warn("Can't drop this kind of object");
				return;
			}
			await this.drop(drop);

			/*
		const data = TextEditor.getDragEventData(event);

		// Handle different data types
		switch (data.type) {
			// write your cases
		}*/


		}

		/**
		 * @param {*} document The document to drop. 
		 */
		async drop(document) {
			throw new Error("drop method must be implemented");
		}

		/**
		 * The callback used to delete a referenced document from the current one.
		 * @param {*} event 
		 * @param {*} target 
		 */
		static async _onRemoveReference(event, target) {
			if (this.locked) return;
			const remove = new DocumentIdentifier(target).toDocument();
			await new DocumentReference(remove).removeFrom(this.document);
			await new DocumentReference(this.document).removeFrom(remove);
		}

		/**
		 * The callback used to open a link.
		 * @param {*} event 
		 * @param {*} target 
		 */
		static async _onOpenLink(event, target) {
			const open = new DocumentIdentifier(target).toDocument();
			if (open == null) {
				ui.notifications.warn("The linked document doesn't exist in the world");
				return;
			}
			open.sheet?.render(true);
		}

		/**
		 * The callback used to toggle the lock state.
		 * @param {*} event 
		 * @param {*} target 
		 */
		static async _onLock(event, target) {
			this.window.lock.classList.remove(NephilimSheet.#getLockIcon(this.locked));
			this.locked = !this.locked;
			this.window.lock.classList.add(NephilimSheet.#getLockIcon(this.locked));
			this.render(false);
		}

		/**
		 * The callback used to setup the document.
		 * @param {*} event 
		 * @param {*} target 
		 */
		static async _onSetup(event, target) {
			await new VersionSelector()
				.withSheet(this)
				.render(true);
		}

		static async _onSetup2(event, target) {
			console.log('setup');

			//await new VersionSelector().render();

			await foundry.applications.api.DialogV2.confirm(
				{ 
					window:	{ 
						title: "Simple Dialog"
					},
					content: `  <form>
									<fieldset>
										<legend>Version</legend>
										<div>
											<div>
												<select>
													<option value="1">Version 1</option>
													<option value="5" selected="5">Version 5</option>
												</select>
											</div>
										</div>
									</fieldset>
									<footer>
										<button type="submit" class="">
											<i class="fa-solid fa-floppy-disk" inert=""></i>
											<span>Sauver la configuration de la feuille</span>
										</button>
									</footer>
								</form>`,
					yes: {
						label: "OK",
						icon: "fas fa-check",
						callback: (html) => { 
							console.log("OK clicked");
						}
					},
					no: {
						label: "Cancel",
						icon: "fas fa-times",
						callback: () => { console.log("Cancel clicked"); }
					},
					defaultYes: true
				}
			)

		}



		async _prepareContext(options) {
			return {
				...await super._prepareContext(options),
				context: {
					version: this.version,
					versions: this.versions
				}
			}
		}

		/**
		 * 
		 * ---------- Tabs management ----------
		 * 
		 */

		/**
		 * Prepare application tab data for a single tab group.
		 * @param {string} group The ID of the tab group to prepare
		 * @returns {Record<string, ApplicationTab>}
		 * @protected
		 * @override
		 */
		_prepareTabs(group) {
			const {tabs, initial=null} = this._getTabsConfig(group) ?? {tabs: []};
			this.tabGroups[group] ??= initial;
			tabs.forEach(t => {
				t.group = group;
				t.label = t.id;
				t.active = t.id === this.tabGroups[group];
			});
			return tabs;
		}

		/**
		 * Handle the click event on a tab.
		 * @param {*} event The click event.
		 * @protected
		 * @override 
		 */
		_onClickTab(event) {
			const button = event.target;
			const tab = button.dataset.tab;
			if (!tab || button.classList.contains("active") || (event.button !== 0)) return;
			const group = button.dataset.group;
			if (this._changeTab(tab, group)) {
				this.render();
			}
		}

		/**
		 * Change the active tab within a tab group in this Application instance.
		 * @param {string} tab        The name of the tab which should become active
		 * @param {string} group      The name of the tab group which defines the set of tabs
		 * @returns true if the a new tab has been selected.
		 * @protected
		 * @override
		 */
		_changeTab(tab, group) {

			// Retrieve the tab element which should become active
			if (!tab || !group) throw new Error("You must pass both the tab and tab group identifier");
			if ((this.tabGroups[group] === tab)) return false;
			const tabElement = this.form.querySelector(`nav [data-group="${group}"][data-tab="${tab}"]`);
			if (!tabElement) throw new Error(`No matching tab element found for group "${group}" and tab "${tab}"`);

			// Update tab navigation
			for (const t of this.form.querySelectorAll(`nav [data-group="${group}"]`)) {
				t.classList.toggle("active", t.dataset.tab === tab);
				if (t instanceof HTMLButtonElement) t.ariaPressed = `${t.dataset.tab === tab}`;
			}

			// Update tab contents
			for (const section of this.form.querySelectorAll(`.tab[data-group="${group}"]`)) {
				section.classList.toggle("active", section.dataset.tab === tab);
			}
			this.tabGroups[group] = tab;
			return true;

		}


	}

}