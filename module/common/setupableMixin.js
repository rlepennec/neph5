/**
 * Mixin apportant la fenêtre de configuration (engrenage de la barre de titre) à une
 * application ApplicationV2.
 *
 * Chaque application concrète déclare sa fenêtre via le getter `optionsSelector` ;
 * l'engrenage apparaît alors automatiquement, et son clic ouvre la fenêtre. Celle-ci
 * est refermée avec l'application.
 *
 * La fenêtre ouverte doit exposer une méthode `withSheet(sheet)` (cf.
 * AbstractOptionsSelector).
 */
export const SetupableMixin = Base => {

    return class Setupable extends Base {

        static DEFAULT_OPTIONS = {
            actions: {
                setup: Setupable._onSetup
            }
        }

        /**
         * Classe de la fenêtre de configuration. Surchargée par les applications
         * concrètes qui en possèdent une. null = pas d'engrenage.
         * @returns {Class|null}
         */
        get optionsSelector() {
            return null;
        }

        /**
         * @returns {boolean} true si l'engrenage doit être proposé.
         */
        get setupable() {
            return this.optionsSelector != null;
        }

        /**
         * Ouvre la fenêtre de configuration et la lie à l'application émettrice.
         */
        static async _onSetup(event, target) {
            await this._onSetup(event, target);
        }

        async _onSetup(event, target) {
            const selector = this.optionsSelector;
            if (selector == null) return;
            this._optionsApp = await new selector().withSheet(this).render(true);
        }

        /**
         * Ajoute l'engrenage dans la barre de titre.
         */
        async _renderFrame(options) {
            const frame = await super._renderFrame(options);
            if (this.setupable) {
                const label = game.i18n.localize("NEPHILIM.setup");
                const html = `<button type="button" class="header-control fa-solid fa-gear icon" data-action="setup" data-tooltip="${label}" aria-label="${label}"></button>`;
                this.window.controls.insertAdjacentHTML("beforebegin", html);
            }
            return frame;
        }

        /**
         * Ferme la fenêtre de configuration restée ouverte.
         */
        async _onClose(options) {
            await super._onClose(options);
            await this._optionsApp?.close();
            this._optionsApp = null;
        }

    }

}