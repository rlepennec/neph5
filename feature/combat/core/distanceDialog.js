import { CombatDialog } from "../core/combatDialog.js";

export class DistanceDialog extends CombatDialog {

    /**
     * Constructor.
     * @param actor  The emiter of the dialog.
     * @param action The action.
     */
    constructor(actor, action) {
        super(actor, action);
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

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find("#shot-1").click(this._onSelectShot.bind(this, 1));
        html.find("#shot2").change(this._onSelectShot.bind(this, 2));
        html.find("#shot3").change(this._onSelectShot.bind(this, 3));
        html.find("#shot4").change(this._onSelectShot.bind(this, 4));
        html.find("#shot5").change(this._onSelectShot.bind(this, 5));
    }

    /**
     * Handle the manoeuver change.
     * @param shot  The index of the shot on which the user has clicked, from 1 to 5.
     * @param event The event to handle.
     */
    async _onSelectShot(shot, event) {
        event.preventDefault();
        if (shot === 1) {
            for (let shot=2; shot<6; shot++) {
                $('#shot'+shot).prop("checked", false);
            }
        } else {
            const checked = this._shot(shot);
            if (checked) {
                for (let i=2; i<shot; i++) {
                    $('#shot'+i).prop("checked", true);
                }
            } else {
                $('#shot'+shot).prop("checked", true);
                for (let i=shot+1; i<this.action.manoeuver.shots.length+1; i++) {
                    $('#shot'+i).prop("checked", false);
                }
            }
        }

        const parameters = this.parameters();
        const modifier = this.action.manoeuverModifier(parameters);
        const difficulty = this.action.difficulty(parameters);
        $('#manoeuverModifier').html(modifier);
        $('#difficulty').html(difficulty);

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
            $('#shot'+shot).prop("checked", false);
        }
    }

    /**
     * Display shots according to the current manoeuver.
     */
    _showShots() {
        for (let shot=1; shot<6; shot++) {
            const id = '#shot-' + shot;
            const visibility = ( 
                this.action.manoeuver.shots === null ||
                this.action.manoeuver.shots.length == 1 ||
                shot > this.action.manoeuver.shots.length ) ? "hidden" : "visible";
            $(id).css("visibility", visibility);
        }
    }

}