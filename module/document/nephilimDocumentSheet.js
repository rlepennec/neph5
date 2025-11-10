import { DropTools } from "./dropTools.js"
import { UUIDReferenceField } from "../common/UUIDReferenceField.js"
import { Tools } from "../common/tools.js"

export class NephilimDocumentSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.DocumentSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["nephilim"],
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
    actions: {
      delete: NephilimDocumentSheet._onDelete,
      open: NephilimDocumentSheet._onOpen
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

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   */
  _onRender(context, options) {
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

    let updates = {};
    const drop = await DropTools.droppedDocument(event);

    // Gather the dropped document if needed to be added in the collection of document if necessary
    Object.entries(this.document.system.schema.fields).every(([fieldName, field]) => {
      if (field instanceof foundry.data.fields.SetField) {
        if (field.element instanceof UUIDReferenceField) {
          if (field.element.collection === drop.documentName && field.element.type === drop.type) {
            if (field.element.droppable) {
              updates["system." + fieldName] = new Set(this.document.system[fieldName]).add(drop.system.id);
            }
            return false;
          }
        }
      }
      return true;
    })

    // Add the dropped document in the collection
    if (Tools.isObjectNotEmpty(updates)) {
      await this.document.update(updates);
    }

  }

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  static async _onDelete(event, target) {

    let updates = {};
    const object = target.closest("[data-id]")?.dataset.id;
    const documentName = object.split(".")[0];
    const type = object.split(".")[1];
    const id = object.split(".")[2];

    // Gather the dropped document if needed to be added in the collection of document if necessary
    Object.entries(this.document.system.schema.fields).every(([fieldName, field]) => {
      if (field instanceof foundry.data.fields.SetField) {
        if (field.element instanceof UUIDReferenceField) {
          if (field.element.collection === documentName && field.element.type === type) {
            if (field.element.deletable) {
              updates["system." + fieldName] = new Set(this.document.system[fieldName]).filter(v => v != id);
            }
            return false;
          }
        }
      }
      return true;
    })

    // Add the dropped document in the collection
    if (Tools.isObjectNotEmpty(updates)) {
      await this.document.update(updates);
    }

  }

  static async _onOpen(event, target) {
    (await fromUuid(target.closest("[data-uuid]")?.dataset.uuid))?.sheet?.render(true);
  }

}