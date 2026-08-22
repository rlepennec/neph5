import { ActionDataBuilder } from "../../core/actionDataBuilder.js";
import { AbstractManoeuver } from "../manoeuver/abstractManoeuver.js";
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
        this.defaultManoeuver = Standard.ID;
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
    async _prepareContext(options) {
        const data = await super._prepareContext(options);
        data.impact = this.action.impact(Standard.ID);
        data.absorption = this.action.absorption(Eviter.ID);
        data.description = CombatDialog.getManoeuverDescription(this.defaultManoeuver, data.impact, data.absorption);
        return data;
    }

    _onRender(context, options) {
        super._onRender(context, options);
        this._on(this.element, "#manoeuver", ["change"], this._onSelectManoeuver);
    }

    /**
     * 
     * @param manoeuver  The identifier of the manoeuver.
     * @param impact     The impact of the attack.
     * @param absorption The absorption of the defense.
     * @return the sentence used to describe the manoeuver.
     */
    static getManoeuverDescription(manoeuver, impact, absorption) {
        let sentence = game.i18n.localize(AbstractManoeuver.clef(manoeuver, "Description"));
        sentence = sentence.replaceAll("${impact}", CustomHandlebarsHelpers.html("<span>" + impact + " <i class='fas fa-heart-broken'></i></span>"));
        sentence = sentence.replaceAll("${absorption}", CustomHandlebarsHelpers.html("<span>" + absorption + " <i class='fas fa-shield'></i></span>"));
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
        const difficulty = this.action.difficulty(parameters);

        this._setText("#difficulty", difficulty + "%");
        this._setApprocheOptions(parameters.manoeuver);
        this._setText("#approcheModifier", "0");
        this._setText("#vecu", base.name);
        this._setText("#base", base.degre);
        this._setText("#manoeuverModifier", this.action.manoeuverModifier(parameters));

        // #description contient du HTML (icônes) -> innerHTML (pas _setText)
        const description = this.element?.querySelector("#description");
        switch (this.action.manoeuver.family) {
            case Constants.FIRE:
            case Constants.BRAWL:
            case Constants.STRIKE:
            case Constants.THROW:
            case Constants.TACTIC: {
                const impact = this.action.impact(parameters.manoeuver);
                if (description) description.innerHTML = CombatDialog.getManoeuverDescription(parameters.manoeuver, impact, 0);
                break;
            }
            case Constants.DODGE:
            case Constants.PARADE: {
                const absorption = this.action.absorption(parameters.manoeuver);
                if (description) description.innerHTML = CombatDialog.getManoeuverDescription(parameters.manoeuver, 0, absorption);
                break;
            }
        }

    }

    _setApprocheOptions(manoeuver) {
        const select = this.element?.querySelector("#approche");
        if (select == null) return;
        const approches = this.action.approches(manoeuver);
        select.innerHTML = Object.keys(approches)
            .map(a => `<option value="${a}">${approches[a].label}</option>`)
            .join("");
    }

    // [V14] _approches(manoeuver) supprimée : elle fabriquait le <select> des
    // approches entier en chaîne de caractères, style en ligne compris, et
    // n'avait aucun appelant — vestige de l'époque où le dialogue s'assemblait
    // ainsi. Le gabarit rend désormais le <select>, et _setApprocheOptions
    // ci-dessus n'en réécrit que les <option> quand la manoeuvre change.

    /**
     * @returns the name and the degre of the competence or the vecu used as
     * base to perform the manoeuver.
     */
    _base() {
        const item = this.action.manoeuver.actorDataPath() == null ?
            ActionDataBuilder.competenceOf(this.actor, this.data.weapon) :
            this.action.manoeuver.competenceUsed(this.actor, this.action.weapon);
        return {
            name: item?.name ?? game.i18n.localize("NEPHILIM.nonDefini"),
            degre: this.action.degre*10
        }
    }

}