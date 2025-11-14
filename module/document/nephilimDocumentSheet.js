import { DocumentTools } from "./documentTools.js"
import { DocumentReference } from "../document/documentReference.js"

export class NephilimDocumentSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.DocumentSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["nephilim"],
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
    actions: {
      delete: NephilimDocumentSheet._onDelete,
      openLink: NephilimDocumentSheet._onOpenLink,
      toggleLock: NephilimDocumentSheet._onToggleLock
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

  dragDrop = this.#createDragDropHandlers();

  // Optional: Add getter to access the private property

  /**
   * Returns an array of DragDrop instances
   * @type {DragDrop[]}
   */
  get dragDrop() {
    return this.dragDrop;
  }


  async _renderFrame(options) {
    console.log("_renderFrame");
    const frame = await super._renderFrame(options);
    const lockIcon = NephilimDocumentSheet.#getToggleIcon(this.locked);
    const lockLabel = 'LOCK'; //game.i18n.localize("SHEETS.CopyUuid");
    const lockId = `<button type="button" class="header-control fa-solid ${lockIcon} icon" data-action="toggleLock" data-tooltip="${lockLabel}" aria-label="${lockLabel}"></button>`;
    this.window.controls.insertAdjacentHTML("beforebegin", lockId);
    this.window.lock = frame.querySelector("button[data-action=toggleLock]");
    return frame;
  }

  /** @inheritDoc */
  async _onFirstRender(context, options) {
    console.log("_onFirstRender");
    await super._onFirstRender(context, options);
    this.locked = this.isEditable;
  }

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   */
  _onRender(context, options) {
    console.log("_onRender");
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
   * @param {DragEvent} event       The originating DragEvent
   * @protected
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
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(event) { }

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event) {
    const drop = await DocumentTools.droppedDocument(event);
    await DocumentReference.createFromItem(drop).addTo(this.document);
  }

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  static async _onDelete(event, target) {
    await DocumentReference.createFromTarget(target).deleteFrom(this.document);
  }

  /**
   * The callback used to open a link.
   * @param {*} event 
   * @param {*} target 
   */
  static async _onOpenLink(event, target) {
    (await fromUuid(target.closest("[data-uuid]")?.dataset.uuid))?.sheet?.render(true);
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
   * @param {*} locked The lock state to display.
   * @returns the class to display the specified state.
   */
  static #getToggleIcon(locked) {
    return locked ? 'fa-lock-open' : 'fa-lock';
  }

}