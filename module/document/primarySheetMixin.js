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


  };

}
