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
					dragSelector: '[data-drag="true"]',
					dropSelector: '[data-drop="true"]'
				}
			],
			actions: {
				delete: NephilimSheet._onRemoveReference,
				open: NephilimSheet._onOpenLink,
				lock: NephilimSheet._onLock,
				select: NephilimSheet._onSelect,
				setup: NephilimSheet._onSetup
			},
			window: {
				resizable: true,
			}
		}

		version = 'v5'; //game.settings.set("neph5e", "worldTemplateVersion", target);

		versions = DocumentTools.getVersions(this.document);

		/**
		 * The sheet is locked by default.
		 */
		locked = true;

		#setupable = true;

		/**
		 * The drag & drop handlers.
		 */
		dragDrop = this.options.dragDrop.map((d) => {
			d.permissions = {
				dragstart: this.#canDragStart.bind(this),
				drop: this.#canDragDrop.bind(this),
			};
			d.callbacks = {
				dragstart: this.#onDragStart.bind(this),
				dragover: this.#onDragOver.bind(this),
				drop: this.#onDrop.bind(this),
			};
			return new foundry.applications.ux.DragDrop.implementation(d);
		});


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
		 * @param {*} locked The lock state to display.
		 * @returns the class to display the toggle icon.
		 * @private
		 */
		static #getLockIcon(locked) {
			return locked ? 'fa-lock' : 'fa-lock-open';
		}

		// Optional: Add getter to access the private property

		/** 
		 * @override
		 * @protected
		 */
		async _onClose() {
		}

		/** 
		 * @override
		 * @protected
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
		 * @protected
		 */
		async _onRender(context, options) {
			this.dragDrop.forEach((d) => d.bind(this.element));
		}

		/**
		 * Define whether a user is able to begin a dragstart workflow for a given drag selector
		 * @param {string} selector       The candidate HTML selector for dragging
		 * @returns {boolean}             Can the current user drag this selector?
		 * @protected
		 */
		#canDragStart(selector) {
			// game.user fetches the current user
			return this.isEditable;
		}

		/**
		 * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
		 * @param {string} selector       The candidate HTML selector for the drop target
		 * @returns {boolean}             Can the current user drop on this selector?
		 * @protected
		 */
		#canDragDrop(selector) {
			// game.user fetches the current user
			return this.isEditable;
		}

		static findDataset(element, attribute) {
			while (element && !(attribute in element.dataset)) {
				element = element.parentElement
			}
			return element?.dataset[attribute] || null
		}

		/**
		 * Callback actions which occur at the beginning of a drag start workflow.
		 * @param {*} event 
		 */
		#onDragStart(event) {

			if ('link' in event.target.dataset) return;

			const fsid = NephilimSheet.findDataset(event.currentTarget, 'fsid');
			if (fsid != null) {
				event.dataTransfer.setData('text/plain', JSON.stringify({
					type: "Sheet",
					fsid: new String(fsid)
				}))
			}

		}

		/**
		 * Callback actions which occur when a dragged element is over a drop target.
		 * @param {*} event 
		 * @param {*} target 
		 */
		#onDragOver(event) {
		}

		/**
		 * @param target The event part which describes the html target.
		 * @returns the draggable element.
		 */
		_getDraggableTarget(target) {
			if (target == null) return null;
			if (target.classList.contains("draggable")) {
				return target;
			} else {
				return this._getDraggableTarget(target.parentElement);
			}
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

		static async _onSelect(event, target) {
			this._onSelect(event, target)
		}

		/**
		 * The callback used to drop an element on a target which must be overriden.
		 * @param {*} event The drop event
		 * @protected
		 */
		async #onDrop(event) {

			if (this.locked) return;

			const dropped = JSON.parse(event.dataTransfer.getData("text/plain"));
			switch (dropped.type) {
				case 'Sheet':
					const document = new DocumentIdentifier(new String(dropped.fsid)).toDocument();
					console.log(document);
					if (document.parent === this.document) {
						console.log("same doc");
					}
					this._onMove(event);
					// move

					break;
				case 'Item':
					console.log('TBD');
					break;
			}

		}

		/**
		 * The callback used to drop an element on a target which must be overriden.
		 * @param {*} event The drop event
		 * @protected
		 */
		async _onMove(event) {
			throw new Error("_onMove method must be implemented");
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

		/**
		 * The callback used to setup the document.
		 * @param {*} event 
		 * @param {*} target 
		 * @protected
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


		/** 
		 * @override
		 */
		async _prepareContext(options) {
			const context = await super._prepareContext(options);
			context.versions = this.versions;
			context.version = this.version;
			context.locked = this.locked;
			context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
				this.document.system.base.description,
				{
					secrets: this.document.isOwner,
					relativeTo: this.document
				}
			)
			return context;
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