/**
 * Adds V2 sheet functionality shared between primary document sheets (Actors & Items).
 * @param {typeof DocumentSheet5e} Base  The base class being mixed.
 * @returns {typeof PrimarySheet5e}
 */
import { DragDropApplicationMixin } from "./dragDropApplicationMixin.js";

export function PrimarySheetMixin(Base) {

  return class PrimarySheetNephilim extends DragDropApplicationMixin(Base) {

  };

}
