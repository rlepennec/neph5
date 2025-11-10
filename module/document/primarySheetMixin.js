/**
 * Adds V2 sheet functionality shared between primary document sheets (Actors & Items).
 * @param {typeof DocumentSheet5e} Base  The base class being mixed.
 * @returns {typeof PrimarySheet5e}
 */
import { DragDropApplicationMixin } from "./dragDropApplicationMixin.js";
import { UUIDReferenceField } from "../common/UUIDReferenceField.js"
import { Tools } from "../common/tools.js"

export function PrimarySheetMixin(Base) {

  return class PrimarySheetNephilim extends DragDropApplicationMixin(Base) {

    static DEFAULT_OPTIONS = {
      actions: {
        delete: PrimarySheetNephilim._onDelete,
      }
    }

    /**
     * Callback actions which occur when a dragged element is dropped on a target.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    static async _onDelete2(event, target) {

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

  };

}
