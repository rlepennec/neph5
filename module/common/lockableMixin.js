export const LockableMixin = Base => {

    return class Lockable extends Base {

        static DEFAULT_OPTIONS = {
            actions: {
                lock: Lockable._onLock
            }
        }

        locked = true;

        /**
         * Indique si le cadenas doit être proposé. Surchargé par les fiches, qui le
         * conditionnent aux permissions (isEditable).
         */
        get lockable() {
            return true;
        }

        static getLockIcon(locked) {
            return locked ? 'fa-lock' : 'fa-lock-open';
        }

        static async _onLock(event, target) {
            this.window.lock.classList.remove(Lockable.getLockIcon(this.locked));
            this.locked = !this.locked;
            this.window.lock.classList.add(Lockable.getLockIcon(this.locked));
            this.render(false);
        }

        async _renderFrame(options) {
            const frame = await super._renderFrame(options);
            if (this.lockable) {
                const icon = Lockable.getLockIcon(this.locked);
                const label = game.i18n.localize("NEPHILIM.toggleLock");
                const html = `<button type="button" class="header-control fa-solid ${icon} icon" data-action="lock" data-tooltip="${label}" aria-label="${label}"></button>`;
                this.window.controls.insertAdjacentHTML("beforebegin", html);
                this.window.lock = frame.querySelector("button[data-action=lock]");
            }
            return frame;
        }

        async _prepareContext(options) {
            const context = await super._prepareContext(options);
            context.locked = this.locked;
            context.editable = !this.locked;
            return context;
        }

    }

}