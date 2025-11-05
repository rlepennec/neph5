/**
 * Base document sheet from which all document-based application should be based.
 */
const { DocumentSheetV2 } = foundry.applications.api;

import { ApplicationV2Mixin } from "./applicationV2Mixin.js";

export class DocumentSheetNephilim extends ApplicationV2Mixin(DocumentSheetV2) {

}