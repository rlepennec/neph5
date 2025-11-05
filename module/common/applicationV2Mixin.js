/**
 * Mixin method for ApplicationV2-based 5e applications.
 * @template {ApplicationV2} T
 * @param {typeof T} Base   Application class being extended.
 * @returns {typeof BaseApplication5e}
 * @mixin
 */


export function ApplicationV2Mixin(Base) {

    class BaseApplicationNephilim extends foundry.applications.api.HandlebarsApplicationMixin(Base) {

        static DEFAULT_OPTIONS = {
            classes: ["nephilim"]
        };

    };

    return BaseApplicationNephilim;

}