import { CombatDialog } from "../core/combatDialog.js";
import { Tirer } from "../manoeuver/tirer.js";

export class DistanceDialog extends CombatDialog {

    /**
     * Constructor.
     * @param actor  The emiter of the dialog.
     * @param action The action.
     */
    constructor(actor, action) {
        super(actor, action);
        this.defaultManoeuver = Tirer.ID;
    }

    /**
     * @param title The title of the dialog panel.
     * @returns the instance.
     */
    withTitle(title) {
        super.withTitle(title);
        return this;
    }

    /**
     * @param template The path of the template file used to create the dialog.
     * @returns the instance.
     */
    withTemplate(template) {
        super.withTemplate(template);
        return this;
    }

    /**
     * @param data The data used to create the content of the dialog.
     * @returns the instance.
     */
    withData(data) {
        super.withData(data);
        return this;
    }

    /**
     * @param height The height of the dialog panel.
     * @returns the instance.
     */
    withHeight(height) {
        super.withHeight(height);
        return this;
    }

    /**
     * @param width The width of the dialog panel.
     * @returns the instance.
     */
    withWidth(width) {
        super.withWidth(width);
        return this;
    }

    _onRender(context, options) {
        super._onRender(context, options);
        this._on(this.element, "#shot-1", ["click"],  (e) => this._onSelectShot(1, e));
        this._on(this.element, "#shot2",  ["change"], (e) => this._onSelectShot(2, e));
        this._on(this.element, "#shot3",  ["change"], (e) => this._onSelectShot(3, e));
        this._on(this.element, "#shot4",  ["change"], (e) => this._onSelectShot(4, e));
        this._on(this.element, "#shot5",  ["change"], (e) => this._onSelectShot(5, e));
    }

    /**
     * Handle the manoeuver change.
     * @param shot  The index of the shot on which the user has clicked, from 1 to 5.
     * @param event The event to handle.
     */
    async _onSelectShot(shot, event) {
        event.preventDefault();
        const check = (i, val) => {
            const c = this.element?.querySelector('#shot' + i);
            if (c) c.checked = val;
        };
        if (shot === 1) {
            for (let s=2; s<6; s++) {
                check(s, false);
            }
        } else {
            const checked = this._shot(shot);
            if (checked) {
                for (let i=2; i<shot; i++) {
                    check(i, true);
                }
            } else {
                check(shot, true);
                for (let i=shot+1; i<this.action.manoeuver.shots.length+1; i++) {
                    check(i, false);
                }
            }
        }

        const parameters = this.parameters();
        this._setText("#manoeuverModifier", this.action.manoeuverModifier(parameters));
        this._setText("#difficulty", this.action.difficulty(parameters) + "%");

    }

    /**
     * Handle the manoeuver change.
     * @param event The event to handle.
     */
    async _onSelectManoeuver(event) {
        await super._onSelectManoeuver(event);
        this._uncheckShots();
        this._showShots();
    }

    _uncheckShots() {
        for (let shot=2; shot<6; shot++) {
            const c = this.element?.querySelector('#shot' + shot);
            if (c) c.checked = false;
        }
    }

    /**
     * Display shots according to the current manoeuver.
     */
    _showShots() {
        if (this.action.manoeuver == null) return;
        for (let shot=1; shot<6; shot++) {          // défense : <7
            const el = this.element?.querySelector('#shot-' + shot);
            if (el == null) continue;
            const hidden = (
                this.action.manoeuver.shots === null ||
                this.action.manoeuver.shots.length == 1 ||
                shot > this.action.manoeuver.shots.length );
            el.classList.toggle("shown", !hidden);
        }
    }

}