class ReferencesDataField extends DataField {

}


/**
 * This module contains data field classes which are used to define a data schema.
 * A data field is responsible for cleaning, validation, and initialization of the value assigned to it.
 * Each data field extends the {@link foundry.data.fields.DataField} class to implement logic specific to its
 * contained data type.
 * @module fields
 */


/**
 * @import {EffectChangeData} from "../documents/_types.mjs";
 * @import {
 *   ArrayFieldOptions,
 *   ChoiceInputConfig,
 *   CodeMirrorInputConfig,
 *   DataFieldContext,
 *   DataFieldOptions,
 *   DataFieldValidationOptions,
 *   DocumentStats,
 *   DocumentUUIDFieldOptions,
 *   FilePathFieldOptions,
 *   FormGroupConfig,
 *   FormInputConfig,
 *   JavaScriptFieldOptions,
 *   NumberFieldOptions,
 *   StringFieldInputConfig,
 *   StringFieldOptions
 * } from "./_types.mjs";
 * @import {Document, DataModel} from "../abstract/_module.mjs";
 * @import {DataSchema, DataModelUpdateOptions} from "../abstract/_types.mjs";
 * @import {FormSelectOption} from "../../client/applications/forms/fields.mjs"
 */

/* ---------------------------------------- */
/*  Abstract Data Field                     */
/* ---------------------------------------- */

/**
 * An abstract class that defines the base pattern for a data field within a data schema.
 * @property {string} name                The name of this data field within the schema that contains it.
 * @mixes DataFieldOptions
 */
class DataField {
  /**
   * @param {DataFieldOptions} [options]    Options which configure the behavior of the field
   * @param {DataFieldContext} [context]    Additional context which describes the field
   */
  constructor(options={}, {name, parent}={}) {
    this.name = name;
    this.parent = parent;
    this.options = options;
    for ( const k in this.constructor._defaults ) {
      this[k] = k in this.options ? this.options[k] : this.constructor._defaults[k];
    }
  }

  /**
   * The field name of this DataField instance.
   * This is assigned by SchemaField#initialize.
   * @internal
   */
  name;

  /**
   * A reference to the parent schema to which this DataField belongs.
   * This is assigned by SchemaField#initialize.
   * @internal
   */
  parent;

  /**
   * The initially provided options which configure the data field
   * @type {DataFieldOptions}
   */
  options;

  /**
   * Whether this field defines part of a Document/Embedded Document hierarchy.
   * @type {boolean}
   */
  static hierarchical = false;

  /**
   * Does this field type contain other fields in a recursive structure?
   * Examples of recursive fields are SchemaField, ArrayField, or TypeDataField
   * Examples of non-recursive fields are StringField, NumberField, or ObjectField
   * @type {boolean}
   */
  static recursive = false;

  /**
   * Default parameters for this field type
   * @returns {DataFieldOptions}
   * @protected
   */
  static get _defaults() {
    return {
      required: false,
      nullable: false,
      initial: undefined,
      readonly: false,
      gmOnly: false,
      label: "",
      hint: "",
      validationError: "is not a valid value"
    };
  }

  /**
   * A dot-separated string representation of the field path within the parent schema.
   * @type {string}
   */
  get fieldPath() {
    return [this.parent?.fieldPath, this.name].filterJoin(".");
  }

  /**
   * Apply a function to this DataField which propagates through recursively to any contained data schema.
   * @param {string|Function} fn          The function to apply
   * @param {*} value                     The current value of this field
   * @param {object} [options={}]         Additional options passed to the applied function
   * @returns {object}                    The results object
   */
  apply(fn, value, options={}) {
    if ( typeof fn === "string" ) fn = this[fn];
    return fn.call(this, value, options);
  }

  /* -------------------------------------------- */

  /**
   * Add types of the source to the data if they are missing.
   * @param {*} source                           The source data
   * @param {*} changes                          The partial data
   * @param {object} [options]                   Additional options
   * @param {object} [options.source]            The root data model source
   * @param {object} [options.changes]           The root data model changes
   * @internal
   */
  _addTypes(source, changes, options) {}

  /* -------------------------------------------- */

  /**
   * Recursively traverse a schema and retrieve a field specification by a given path
   * @param {string[]} path             The field path as an array of strings
   * @returns {DataField|undefined}     The corresponding DataField definition for that field, or undefined
   * @internal
   */
  _getField(path) {
    return path.length ? undefined : this;
  }

  /* -------------------------------------------- */
  /*  Field Cleaning                              */
  /* -------------------------------------------- */

  /**
   * Coerce source data to ensure that it conforms to the correct data type for the field.
   * Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed.
   * For one-off cleaning of user-provided input the sanitize method should be used.
   * @param {*} value           An initial requested value
   * @param {object} [options]  Additional options for how the field is cleaned
   * @param {boolean} [options.partial]   Whether to perform partial cleaning?
   * @param {object} [options.source]     The root data model being cleaned
   * @returns {*}               The cast value
   */
  clean(value, options={}) {

    // Get an initial value for the field
    if ( value === undefined ) return this.getInitialValue(options.source);

    // Keep allowed special values
    try {
      const isValid = this._validateSpecial(value);
      if ( isValid === true ) return value;
    } catch(err) {
      return this.getInitialValue(options.source);
    }

    // Cast a provided value to the correct type
    value = this._cast(value);

    // Cleaning logic specific to the DataField.
    return this._cleanType(value, options);
  }

  /* -------------------------------------------- */

  /**
   * Apply any cleaning logic specific to this DataField type.
   * @param {*} value           The appropriately coerced value.
   * @param {object} [options]  Additional options for how the field is cleaned.
   * @returns {*}               The cleaned value.
   * @protected
   */
  _cleanType(value, options) {
    return value;
  }

  /* -------------------------------------------- */

  /**
   * Cast a non-default value to ensure it is the correct type for the field
   * @param {*} value       The provided non-default value
   * @returns {*}           The standardized value
   * @protected
   */
  _cast(value) {
    return value;
  }

  /* -------------------------------------------- */

  /**
   * Attempt to retrieve a valid initial value for the DataField.
   * @param {object} data   The source data object for which an initial value is required
   * @returns {*}           A proposed initial value
   */
  getInitialValue(data) {
    if ( this.initial instanceof Function ) return this.initial(data);  // Explicit function
    else if ( this.initial !== undefined ) return this.initial;         // Explicit value
    if ( !this.required ) return undefined;                             // Prefer undefined if non-required
    if ( this.nullable ) return null;                                   // Prefer explicit null
    return undefined;                                                   // Otherwise undefined
  }

  /* -------------------------------------------- */

  /**
   * Export the current value of the field into a serializable object.
   * @param {*} value                   The initialized value of the field
   * @returns {*}                       An exported representation of the field
   */
  toObject(value) {
    return value;
  }

  /* -------------------------------------------- */
  /*  Field Validation                            */
  /* -------------------------------------------- */

  /**
   * Validate a candidate input for this field, ensuring it meets the field requirements.
   * A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning
   * a DataModelValidationFailure instance.
   * A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.
   * @param {*} value                                  The initial value
   * @param {DataFieldValidationOptions} [options={}]  Options which affect validation behavior
   * @returns {DataModelValidationFailure|void}        Returns a DataModelValidationFailure if a validation failure
   *                                                   occurred.
   */
  validate(value, options={}) {
    const validators = [this._validateSpecial, this._validateType];
    if ( this.options.validate ) validators.push(this.options.validate);
    try {
      for ( const validator of validators ) {
        const isValid = validator.call(this, value, options);
        if ( isValid === true ) return undefined;
        if ( isValid === false ) {
          return new DataModelValidationFailure({
            invalidValue: value,
            message: this.validationError,
            unresolved: true
          });
        }
        if ( isValid instanceof DataModelValidationFailure ) return isValid;
      }
    } catch(err) {
      return new DataModelValidationFailure({invalidValue: value, message: err.message, unresolved: true});
    }
  }

  /* -------------------------------------------- */

  /**
   * Special validation rules which supersede regular field validation.
   * This validator screens for certain values which are otherwise incompatible with this field like null or undefined.
   * @param {*} value               The candidate value
   * @returns {boolean|void}        A boolean to indicate with certainty whether the value is valid.
   *                                Otherwise, return void.
   * @throws {Error}                May throw a specific error if the value is not valid
   * @protected
   */
  _validateSpecial(value) {

    // Allow null values for explicitly nullable fields
    if ( value === null ) {
      if ( this.nullable ) return true;
      else throw new Error("may not be null");
    }

    // Allow undefined if the field is not required
    if ( value === undefined ) {
      if ( this.required ) throw new Error("may not be undefined");
      else return true;
    }
  }

  /* -------------------------------------------- */

  /**
   * A default type-specific validator that can be overridden by child classes
   * @param {*} value                                    The candidate value
   * @param {DataFieldValidationOptions} [options={}]    Options which affect validation behavior
   * @returns {boolean|DataModelValidationFailure|void}  A boolean to indicate with certainty whether the value is
   *                                                     valid, or specific DataModelValidationFailure information,
   *                                                     otherwise void.
   * @throws                                             May throw a specific error if the value is not valid
   * @protected
   */
  _validateType(value, options={}) {}

  /* -------------------------------------------- */

  /**
   * Certain fields may declare joint data validation criteria.
   * This method will only be called if the field is designated as recursive.
   * @param {object} data       Candidate data for joint model validation
   * @param {object} options    Options which modify joint model validation
   * @throws  An error if joint model validation fails
   * @internal
   */
  _validateModel(data, options={}) {}

  /* -------------------------------------------- */
  /*  Initialization and Updates                  */
  /* -------------------------------------------- */

  /**
   * Initialize the original source data into a mutable copy for the DataModel instance.
   * @param {*} value                   The source value of the field
   * @param {Object} model              The DataModel instance that this field belongs to
   * @param {object} [options]          Initialization options
   * @returns {*}                       An initialized copy of the source data
   */
  initialize(value, model, options={}) {
    return value;
  }

  /* -------------------------------------------- */

  /**
   * Update the source data for a DataModel which includes this DataField.
   * This method is responsible for modifying the provided source data as well as updating the tracked diff included
   * in provided metadata.
   * @param {object} source               Source data of the DataModel which should be updated. This object is always
   *                                      a partial node of source data, relative to which this field belongs.
   * @param {string} key                  The name of this field within the context of the source data.
   * @param {any} value                   The candidate value that should be applied as an update.
   * @param {object} difference           The accumulated diff that is recursively populated as the model traverses
   *                                      through its schema fields.
   * @param {DataModelUpdateOptions} options Options which modify how this update workflow is performed.
   * @throws {Error}                      An error if the requested update cannot be performed.
   * @internal
   */
  _updateDiff(source, key, value, difference, options) {
    const current = source[key];
    if ( value === current ) return;
    difference[key] = value;
    source[key] = value;
  }

  /* -------------------------------------------- */

  /**
   * Commit a prepared update to DataModel#_source.
   * @param {object} source               The parent source object within which the `key` field exists
   * @param {string} key                  The named field in source to commit
   * @param {object} value                The new value of the field which should be committed to source
   * @param {object} diff                 The reported change to the field
   * @param {DataModelUpdateOptions} options Options which modify how this update workflow is performed.
   * @internal
   */
  _updateCommit(source, key, value, diff, options) {
    source[key] = value;
  }

  /* -------------------------------------------- */
  /*  Form Field Integration                      */
  /* -------------------------------------------- */

  /**
   * Does this form field class have defined form support?
   * @type {boolean}
   */
  static get hasFormSupport() {
    return this.prototype._toInput !== DataField.prototype._toInput;
  }

  /* -------------------------------------------- */

  /**
   * Render this DataField as an HTML element.
   * @param {FormInputConfig} config        Form element configuration parameters
   * @throws {Error}                        An Error if this DataField subclass does not support input rendering
   * @returns {HTMLElement|HTMLCollection}  A rendered HTMLElement for the field
   */
  toInput(config={}) {
    const inputConfig = {name: this.fieldPath, ...config};
    if ( inputConfig.input instanceof Function ) return config.input(this, inputConfig);
    return this._toInput(inputConfig);
  }

  /* -------------------------------------------- */

  // eslint-disable-next-line jsdoc/require-returns-check
  /**
   * Render this DataField as an HTML element.
   * Subclasses should implement this method rather than the public toInput method which wraps it.
   * @param {FormInputConfig} config        Form element configuration parameters
   * @throws {Error}                        An Error if this DataField subclass does not support input rendering
   * @returns {HTMLElement|HTMLCollection}  A rendered HTMLElement for the field
   * @protected
   */
  _toInput(config) {
    throw new Error(`The ${this.constructor.name} class does not implement the _toInput method`);
  }

  /* -------------------------------------------- */

  /**
   * Render this DataField as a standardized form-group element.
   * @param {FormGroupConfig} groupConfig   Configuration options passed to the wrapping form-group
   * @param {FormInputConfig} inputConfig   Input element configuration options passed to DataField#toInput
   * @returns {HTMLDivElement}              The rendered form group element
   */
  toFormGroup(groupConfig={}, inputConfig={}) {
    if ( groupConfig.widget instanceof Function ) return groupConfig.widget(this, groupConfig, inputConfig);
    groupConfig.label ??= this.label ?? this.fieldPath;
    groupConfig.hint ??= this.hint;
    groupConfig.input ??= this.toInput(inputConfig);
    return foundry.applications.fields.createFormGroup(groupConfig);
  }

  /* -------------------------------------------- */
  /*  Active Effect Integration                   */
  /* -------------------------------------------- */

  /**
   * Apply an ActiveEffectChange to this field.
   * @param {*} value                  The field's current value.
   * @param {DataModel} model          The model instance.
   * @param {EffectChangeData} change  The change to apply.
   * @returns {*}                      The updated value.
   */
  applyChange(value, model, change) {
    const delta = this._castChangeDelta(change.value);
    switch ( change.mode ) {
      case CONST.ACTIVE_EFFECT_MODES.ADD: return this._applyChangeAdd(value, delta, model, change);
      case CONST.ACTIVE_EFFECT_MODES.MULTIPLY: return this._applyChangeMultiply(value, delta, model, change);
      case CONST.ACTIVE_EFFECT_MODES.OVERRIDE: return this._applyChangeOverride(value, delta, model, change);
      case CONST.ACTIVE_EFFECT_MODES.UPGRADE: return this._applyChangeUpgrade(value, delta, model, change);
      case CONST.ACTIVE_EFFECT_MODES.DOWNGRADE: return this._applyChangeDowngrade(value, delta, model, change);
    }
    return this._applyChangeCustom(value, delta, model, change);
  }

  /* -------------------------------------------- */

  /**
   * Cast a change delta into an appropriate type to be applied to this field.
   * @param {*} delta  The change delta.
   * @returns {*}
   * @internal
   */
  _castChangeDelta(delta) {
    return this._cast(delta);
  }

  /* -------------------------------------------- */

  /**
   * Apply an ADD change to this field.
   * @param {*} value                  The field's current value.
   * @param {*} delta                  The change delta.
   * @param {DataModel} model          The model instance.
   * @param {EffectChangeData} change  The original change data.
   * @returns {*}                      The updated value.
   * @protected
   */
  _applyChangeAdd(value, delta, model, change) {
    return value + delta;
  }

  /* -------------------------------------------- */

  /**
   * Apply a MULTIPLY change to this field.
   * @param {*} value                  The field's current value.
   * @param {*} delta                  The change delta.
   * @param {DataModel} model          The model instance.
   * @param {EffectChangeData} change  The original change data.
   * @returns {*}                      The updated value.
   * @protected
   */
  _applyChangeMultiply(value, delta, model, change) {}

  /* -------------------------------------------- */

  /**
   * Apply an OVERRIDE change to this field.
   * @param {*} value                  The field's current value.
   * @param {*} delta                  The change delta.
   * @param {DataModel} model          The model instance.
   * @param {EffectChangeData} change  The original change data.
   * @returns {*}                      The updated value.
   * @protected
   */
  _applyChangeOverride(value, delta, model, change) {
    return delta;
  }

  /* -------------------------------------------- */

  /**
   * Apply an UPGRADE change to this field.
   * @param {*} value                  The field's current value.
   * @param {*} delta                  The change delta.
   * @param {DataModel} model          The model instance.
   * @param {EffectChangeData} change  The original change data.
   * @returns {*}                      The updated value.
   * @protected
   */
  _applyChangeUpgrade(value, delta, model, change) {}

  /* -------------------------------------------- */

  /**
   * Apply a DOWNGRADE change to this field.
   * @param {*} value                  The field's current value.
   * @param {*} delta                  The change delta.
   * @param {DataModel} model          The model instance.
   * @param {EffectChangeData} change  The original change data.
   * @returns {*}                      The updated value.
   * @protected
   */
  _applyChangeDowngrade(value, delta, model, change) {}

  /* -------------------------------------------- */

  /**
   * Apply a CUSTOM change to this field.
   * @param {*} value                  The field's current value.
   * @param {*} delta                  The change delta.
   * @param {DataModel} model          The model instance.
   * @param {EffectChangeData} change  The original change data.
   * @returns {*}                      The updated value.
   * @protected
   */
  _applyChangeCustom(value, delta, model, change) {
    const preHook = foundry.utils.getProperty(model, change.key);
    Hooks.call("applyActiveEffect", model, change, value, delta, {});
    const postHook = foundry.utils.getProperty(model, change.key);
    if ( postHook !== preHook ) return postHook;
  }
}

/**
 * A subclass of {@link foundry.data.fields.DataField} which deals with array-typed data.
 * @template [ElementType=DataField]
 * @property {number} min     The minimum number of elements.
 * @property {number} max     The maximum number of elements.
 */
class ArrayField extends DataField {
  /**
   * @param {ElementType} element          The type of element contained in the Array
   * @param {ArrayFieldOptions} [options]  Options which configure the behavior of the field
   * @param {DataFieldContext} [context]   Additional context which describes the field
   */
  constructor(element, options={}, context={}) {
    super(options, context);
    this.element = this.constructor._validateElementType(element);
    if ( this.element instanceof DataField ) {
      this.element.name ||= "element";
      this.element.parent = this;
    }
    if ( this.min > this.max ) throw new Error("ArrayField minimum length cannot exceed maximum length");
  }

  /* ---------------------------------------- */

  /**
   * The data type of each element in this array
   * @type {ElementType}
   */
  element;

  /* ---------------------------------------- */

  /** @inheritdoc */
  static get _defaults() {
    return Object.assign(super._defaults, {
      required: true,
      nullable: false,
      empty: true,
      exact: undefined,
      min: 0,
      max: Infinity
    });
  }

  /* ---------------------------------------- */

  /** @override */
  static recursive = true;

  /* ---------------------------------------- */

  /**
   * Validate the contained element type of the ArrayField
   * @param {*} element        The type of Array element
   * @returns {ElementType}    The validated element type
   * @throws                   An error if the element is not a valid type
   * @protected
   */
  static _validateElementType(element) {
    if ( !(element instanceof DataField) ) {
      throw new Error(`${this.name} must have a DataField as its contained element`);
    }
    if ( element.parent !== undefined ) throw new Error("The element DataField already has a parent");
    return element;
  }

  /* -------------------------------------------- */

  /** @override */
  getInitialValue(data) {
    const initial = super.getInitialValue(data);
    if ( this.required && (initial === undefined) ) return [];
    return initial;
  }

  /* ---------------------------------------- */

  /** @override */
  _validateModel(changes, options) {
    if ( !this.element.constructor.recursive ) return;
    for ( const element of changes ) {
      this.element._validateModel(element, options);
    }
  }

  /* ---------------------------------------- */

  /** @override */
  _cast(value) {
    const t = getType(value);
    if ( t === "Object" ) {
      const arr = [];
      for ( const [k, v] of Object.entries(value) ) {
        const i = Number(k);
        if ( Number.isInteger(i) && (i >= 0) ) arr[i] = v;
      }
      return arr;
    }
    else if ( t === "Set" ) return Array.from(value);
    return value instanceof Array ? value : [value];
  }

  /** @override */
  _cleanType(value, options) {
    // Force partial as false for array cleaning. Arrays are updated by replacing the entire array, so partial data
    // must be initialized.
    return value.map(v => this.element.clean(v, { ...options, partial: false }));
  }

  /** @override */
  _validateType(value, options={}) {
    if ( !(value instanceof Array) ) throw new Error("must be an Array");
    if ( value.length < this.min ) throw new Error(`cannot have fewer than ${this.min} elements`);
    if ( value.length > this.max ) throw new Error(`cannot have more than ${this.max} elements`);
    return this._validateElements(value, options);
  }

  /**
   * Validate every element of the ArrayField
   * @param {Array} value                         The array to validate
   * @param {DataFieldValidationOptions} options  Validation options
   * @returns {DataModelValidationFailure|void}   A validation failure if any of the elements failed validation,
   *                                              otherwise void.
   * @protected
   */
  _validateElements(value, options) {
    const arrayFailure = new DataModelValidationFailure();
    for ( let i=0; i<value.length; i++ ) {
      // Force partial as false for array validation. Arrays are updated by replacing the entire array, so there cannot
      // be partial data in the elements.
      const failure = this._validateElement(value[i], { ...options, partial: false });
      if ( failure ) {
        arrayFailure.elements.push({id: i, failure});
        arrayFailure.unresolved ||= failure.unresolved;
      }
    }
    if ( arrayFailure.elements.length ) return arrayFailure;
  }

  /**
   * Validate a single element of the ArrayField.
   * @param {*} value                       The value of the array element
   * @param {DataFieldValidationOptions} options  Validation options
   * @returns {DataModelValidationFailure}  A validation failure if the element failed validation
   * @protected
   */
  _validateElement(value, options) {
    return this.element.validate(value, options);
  }

  /** @override */
  initialize(value, model, options={}) {
    if ( !value ) return value;
    return value.map(v => this.element.initialize(v, model, options));
  }

  /* ---------------------------------------- */

  /** @override */
  _updateDiff(source, key, value, difference, options) {
    const current = source[key];
    value = applySpecialKeys(value);
    if ( (value === current) || value?.equals(current) ) return;
    source[key] = value;
    difference[key] = deepClone(value);
  }

  /* ---------------------------------------- */

  /**
   * Commit array field changes by replacing array contents while preserving the array reference itself.
   * @override
   */
  _updateCommit(source, key, value, diff, options) {
    const s = source[key];

    // Special Cases: * -> undefined, * -> null, undefined -> *, null -> *
    if ( !s || !value ) {
      source[key] = value;
      return;
    }

    s.length = 0;
    s.push(...value);
  }

  /* ---------------------------------------- */

  /** @override */
  toObject(value) {
    if ( !value ) return value;
    return value.map(v => this.element.toObject(v));
  }

  /** @override */
  apply(fn, value=[], options={}) {

    // Apply to this ArrayField
    const thisFn = typeof fn === "string" ? this[fn] : fn;
    thisFn?.call(this, value, options);
    if ( !Array.isArray(value) ) return value; // Do not recurse for non-array types

    // Recursively apply to array elements
    const results = [];
    if ( !value.length && options.initializeArrays ) value = [undefined];
    for ( const v of value ) {
      const r = this.element.apply(fn, v, options);
      if ( !options.filter || !isEmpty(r) ) results.push(r);
    }
    return results;
  }

  /** @override */
  _getField(path) {
    if ( path.length === 0 ) return this;
    if ( path.shift() !== this.element.name ) return undefined;
    return this.element._getField(path);
  }

  /**
   * Migrate this field's candidate source data.
   * @param {object} sourceData   Candidate source data of the root model
   * @param {any} fieldData       The value of this field within the source data
   */
  migrateSource(sourceData, fieldData) {
    if ( !(this.element.migrateSource instanceof Function) ) return;
    if ( getType(fieldData) !== "Array" ) return;
    for ( const entry of fieldData ) this.element.migrateSource(sourceData, entry);
  }

  /* -------------------------------------------- */
  /*  Active Effect Integration                   */
  /* -------------------------------------------- */

  /** @override */
  _castChangeDelta(raw) {
    let delta;
    try {
      delta = JSON.parse(raw);
      delta = Array.isArray(delta) ? delta : [delta];
    } catch(_err) {
      delta = [raw];
    }
    return delta.map(value => this.element._castChangeDelta(value));
  }

  /** @override */
  _applyChangeAdd(value, delta, model, change) {
    value.push(...delta);
    return value;
  }
}

/**
 * A subclass of {@link foundry.data.fields.ArrayField} which supports a set of contained elements.
 * Elements in this set are treated as fungible and may be represented in any order or discarded if invalid.
 */
class SetField extends ArrayField {

  /** @override */
  _validateElements(value, options) {
    const setFailure = new DataModelValidationFailure();
    for ( let i=value.length-1; i>=0; i-- ) {  // Iterate backwards so we can splice as we go
      const failure = this._validateElement(value[i], options);
      if ( failure ) {
        setFailure.elements.unshift({id: i, failure});

        // The failure may have been internally resolved by fallback logic
        if ( !failure.unresolved && failure.fallback ) continue;

        // If fallback is allowed, remove invalid elements from the set
        if ( options.fallback ) {
          value.splice(i, 1);
          failure.dropped = true;
        }

        // Otherwise the set failure is unresolved
        else setFailure.unresolved = true;
      }
    }

    // Return a record of any failed set elements
    if ( setFailure.elements.length ) {
      if ( options.fallback && !setFailure.unresolved ) setFailure.fallback = value;
      return setFailure;
    }
  }

  /** @override */
  initialize(value, model, options={}) {
    if ( !value ) return value;
    return new Set(super.initialize(value, model, options));
  }

  /** @override */
  toObject(value) {
    if ( !value ) return value;
    return Array.from(value).map(v => this.element.toObject(v));
  }

  /* -------------------------------------------- */
  /*  Form Field Integration                      */
  /* -------------------------------------------- */

  /** @override */
  _toInput(config) {
    const element = this.element;

    // Document UUIDs
    if ( element instanceof DocumentUUIDField ) {
      Object.assign(config, {type: element.type, single: false});
      return foundry.applications.elements.HTMLDocumentTagsElement.create(config);
    }

    // Multi-Select Input
    if ( element.choices && !config.options ) {
      config.choices ??= element.choices;
      StringField._prepareChoiceConfig(config);
    }
    if ( config.options ) {
      if ( element instanceof NumberField ) mergeObject(config, {dataset: {dtype: "Number"}});
      return foundry.applications.fields.createMultiSelectInput(config);
    }

    // Arbitrary String Tags
    if ( element instanceof StringField ) return foundry.applications.elements.HTMLStringTagsElement.create(config);
    throw new Error(`SetField#toInput is not supported for a ${element.constructor.name} element type`);
  }

  /* -------------------------------------------- */
  /*  Active Effect Integration                   */
  /* -------------------------------------------- */

  /** @inheritDoc */
  _castChangeDelta(raw) {
    return new Set(super._castChangeDelta(raw));
  }

  /** @override */
  _applyChangeAdd(value, delta, model, change) {
    for ( const element of delta ) value.add(element);
    return value;
  }
}