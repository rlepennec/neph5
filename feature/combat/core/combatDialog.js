import { ActionDataBuilder } from "../../core/actionDataBuilder.js";
import { ActionDialog } from "../../core/actionDialog.js";
import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";
import { Constants } from "../../../module/common/constants.js";
import { Eviter } from "../manoeuver/eviter.js";
import { Standard } from "../manoeuver/standard.js";

export class CombatDialog extends ActionDialog {

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
     * @returns the default options to manage the dialog.
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {});
    }

    /**
     * @override
     */
    getData(options) {
        const data = super.getData(options);
        data.impact = this.action.impact(Standard.ID);
        data.absorption = this.action.absorption(Eviter.ID);
        data.description = CombatDialog.getManoeuverDescription(Standard.ID, data.impact, data.absorption);
        return data;
    }

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find("#manoeuver").change(this._onSelectManoeuver.bind(this));
    }

    /**
     * 
     * @param manoeuver  The identifier of the manoeuver.
     * @param impact     The impact of the attack.
     * @param absorption The absorption of the defense.
     * @return the sentence used to describe the manoeuver.
     */
    static getManoeuverDescription(manoeuver, impact, absorption) {
        let sentence = game.i18n.localize("NEPH5E.manoeuvres." + manoeuver + ".description");
        sentence = sentence.replaceAll("${impact}", CustomHandlebarsHelpers.html("<span>" + impact + " <i class='fas fa-heart-broken'></i></span>"));
        sentence = sentence.replaceAll("${absorption}", absorption);
        return sentence;
    }

    /**
     * Handle the manoeuver change.
     * @param event The event to handle.
     */
    async _onSelectManoeuver(event) {

        event.preventDefault();
        const parameters = this.parameters();
        parameters.approche = 0;
        this.action.setManoeuver(parameters.manoeuver);
        const base = this._base();
        const approches = this._approches(parameters.manoeuver);
        const difficulty = this.action.difficulty(parameters);
        
        $('#difficulty').html(difficulty+"%");
        $("#approche").html(approches);
        $('#approcheModifier').html("0");
        $('#vecu').html(base.name);
        $('#base').html(base.degre);
        $('#manoeuverModifier').html(this.action.manoeuverModifier(parameters));

        switch (this.action.manoeuver.family) {
            case Constants.FIRE:
            case Constants.BRAWL:
            case Constants.STRIKE:
            case Constants.THROW:
            case Constants.TACTIC: {
                const impact = this.action.impact(parameters.manoeuver);
                $('#description').html(CombatDialog.getManoeuverDescription(parameters.manoeuver, impact, 0));
                break;
            }
            case Constants.DODGE:
            case Constants.PARADE: {
                const absorption = this.action.absorption(manoeuver);
                $('#description').html(CombatDialog.getManoeuverDescription(parameters.manoeuver, 0, absorption));
                break;
            }
        }

    }

    /**
     * @param manoeuver The identifier of the manoeuver.
     * @returns the approches to display in the action dialog according to the manoeuver and the actor.
     */
    _approches(manoeuver) {
        const approches = this.action.approches(manoeuver);
        let html = "<select id='approche' name='approche' style='padding-left:15px;flex: 0 0 auto;border:none;outline:0px;background-color:transparent;'>";
        for (const a in approches) {
            html = html + "<option value='" + a + "'>" + approches[a].label + "</option>";
        }
        html = html + "</select>";
        return html;
    }

    /**
     * @returns the name and the degre of the competence or the vecu used as
     * base to perform the manoeuver.
     */
    _base() {
        const item = this.action.manoeuver.actorDataPath() == null ?
            ActionDataBuilder.competenceOf(this.actor, this.data.weapon) :
            this.action.manoeuver.competenceUsed(this.actor, this.action.weapon);
        return {
            name: item?.name ?? game.i18n.localize("NEPH5E.nonDefini"),
            degre: this.action.degre*10
        }
    }

}