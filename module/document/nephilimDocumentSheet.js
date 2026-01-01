import { DocumentIdentifier } from "../document/documentIdentifier.js"
import { DocumentReference } from "../document/documentReference.js"

export class NephilimDocumentSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.DocumentSheetV2) {

	static DEFAULT_OPTIONS = {
		classes: ["nephilim"],
		dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
		actions: {
			delete: NephilimDocumentSheet._onRemoveReference,
			open: NephilimDocumentSheet._onOpenLink,
			lock: NephilimDocumentSheet._onToggleLock,
			setup: NephilimDocumentSheet._onSetup
		}
	}

	locked = true;

	setupable = true;

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

	dragDrop = this.#createDragDropHandlers();

	// Optional: Add getter to access the private property

	/**
	 * Returns an array of DragDrop instances
	 * @type {DragDrop[]}
	 */
	get dragDrop() {
		return this.dragDrop;
	}

	/** 
	 * @override
	 */
	async _renderFrame(options) {

		const frame = await super._renderFrame(options);

		if (this.isEditable) {
			const lockIcon = NephilimDocumentSheet.#getToggleIcon(this.locked);
			const lockLabel = game.i18n.localize("NEPHILIM.toggleLock");
			const lockId = `<button type="button" class="header-control fa-solid ${lockIcon} icon" data-action="lock" data-tooltip="${lockLabel}" aria-label="${lockLabel}"></button>`;
			this.window.controls.insertAdjacentHTML("beforebegin", lockId);
			this.window.lock = frame.querySelector("button[data-action=lock]");
		}

		if (this.setupable) {
			const lockIcon = NephilimDocumentSheet.#getSetupIcon();
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
		this.dragDrop.forEach((d) => d.bind(this.element));
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
		await new DocumentReference(this.document).removeFromRegister(drop);
		await new DocumentReference(drop).addTo(this.document);
		await new DocumentReference(this.document).addTo(drop);
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
	static async _onToggleLock(event, target) {
		this.window.lock.classList.remove(NephilimDocumentSheet.#getToggleIcon(this.locked));
		this.locked = !this.locked;
		this.window.lock.classList.add(NephilimDocumentSheet.#getToggleIcon(this.locked));
		this.render(false);
	}

	/**
	 * The callback used to setup the document.
	 * @param {*} event 
	 * @param {*} target 
	 */
	static async _onSetup(event, target) {
		console.log('setup');
	}


	/**
	 * @param {*} locked The lock state to display.
	 * @returns the class to display the toggle icon.
	 */
	static #getToggleIcon(locked) {
		return locked ? 'fa-lock' : 'fa-lock-open';
	}

	/**
	 * @returns the class to display the setup icon.
	 */
	static #getSetupIcon() {
		return 'fa-solid fa-gear';
	}

}