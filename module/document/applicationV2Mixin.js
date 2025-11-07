/**
 * Mixin method for ApplicationV2-based 5e applications.
 * @template {ApplicationV2} T
 * @param <T> Base The Application class to extend.
 * @returns a class <BaseApplicationNephilim>
 * @mixin
 */
export function ApplicationV2Mixin(Base) {

    return class BaseApplicationNephilim extends foundry.applications.api.HandlebarsApplicationMixin(Base) {

        static DEFAULT_OPTIONS = {
            classes: ["nephilim"]
        };

    };

}