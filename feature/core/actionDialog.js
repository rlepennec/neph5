import { AbstractDialog } from "./abstractDialog.js";

export class ActionDialog extends AbstractDialog {

    /**
     * Constructor.
     * @param actor  The emiter of the dialog.
     * @param action The action.
     */
    constructor(actor, action) {
        super(actor);
        this.actor = actor;
        this.action = action;
        this.data = null;
        this.mnemos = 0;
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
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["nephilim", "sheet"],
            template: "systems/neph5e/feature/core/action.hbs",
            width: 500,
            height: "auto",
            choices: {},
            allowCustom: true,
            minimum: 0,
            maximum: null,
            closeOnSubmit: false
        });
    }

    /**
     * @override
     */
    getData(options) {
        const data = duplicate(this.data);
        data.owner = this.object.id;
        data.difficulty = this.action.difficulty(this.parameters());
        return data;
    }

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find("#modifier").change(this._onSetModifier.bind(this));
        html.find("#modifier").on('input', this._onSetModifier.bind(this));
        html.find("#fraternite").change(this._onSelectFraternite.bind(this));
        html.find("#blessures").change(this._onSelectBlessures.bind(this));
        html.find("#approche").change(this._onSelectApproche.bind(this));
        html.find("#element").change(this._onSelectElement.bind(this));
        html.find("#opposition").change(this._onSetOpposition.bind(this));
        html.find("#opposition").on('input', this._onSetOpposition.bind(this));
        html.find("#metamorphe").change(this._onSelectMetamorphe.bind(this));
        html.find(".mnemos-modifier").change(this._onSelectMnemos.bind(this));
        html.find("#roll").click(this._onRoll.bind(this));
        html.find("#details").click(this._onDetails.bind(this));
    }

    /**
     * Handle the details display change.
     * @param event The event to handle.
     */
    async _onDetails(event) {
        event.preventDefault();
        $(".hiddable").toggle();
    }

    /**
     * Handle the modifier change.
     * @param event The event to handle.
     */
    async _onSetModifier(event) {
        event.preventDefault();
        const parameters = this.parameters();
        const difficulty = this.action.difficulty(parameters);
        $('#difficulty').html(difficulty + "%");
        $('#sliderModifier').html("<label id='sliderModifier'>" + parameters.modifier + "<label>");
    }

    /**
     * Handle the fraternite use change.
     * @param event The event to handle.
     */
    async _onSelectFraternite(event) {
        event.preventDefault();
        const parameters = this.parameters();
        const fraternite = parameters.fraternite;
        const difficulty = this.action.difficulty(parameters);
        $('#fraterniteModifier').html("<span>" + fraternite + "<span>");
        $('#difficulty').html(difficulty + "%");
    }

    /**
     * Handle the blessures modifier change.
     * @param event The event to handle.
     */
     async _onSelectBlessures(event) {
        event.preventDefault();
        const parameters = this.parameters();
        const blessures = parameters.blessures;
        const difficulty = this.action.difficulty(parameters);
        $('#blessuresModifier').html("<span>" + blessures + "<span>");
        $('#difficulty').html(difficulty + "%");
    }

    /**
     * Handle the approche change.
     * @param event The event to handle.
     */
    async _onSelectApproche(event) {
        event.preventDefault();
        const parameters = this.parameters();
        const approche = parameters.approche;
        const difficulty = this.action.difficulty(parameters);
        $('#approcheModifier').html("<span>" + approche + "<span>");
        $('#difficulty').html(difficulty + "%");
    }

    /**
     * Handle the approche change.
     * @param event The event to handle.
     */
    async _onSelectMnemos(event) {
        event.preventDefault();
        const parameters = this.parameters();
        const difficulty = this.action.difficulty(parameters);
        $('#difficulty').html(difficulty + "%");
    }

    /**
     * Handle the element change.
     * @param event The event to handle.
     */
    async _onSelectElement(event) {
        event.preventDefault();
        const parameters = this.parameters();
        const difficulty = this.action.difficulty(parameters);
        $('#difficulty').html(difficulty + "%");
    }

    /**
     * Handle the opposition change.
     * @param event The event to handle.
     */
    async _onSetOpposition(event) {
        event.preventDefault();
        const parameters = this.parameters();
        const difficulty = this.action.difficulty(parameters);
        const note = this.action.note(parameters);
        $('#difficulty').html(difficulty + "%");
        $('#sliderOpposition').html("<label id='sliderOpposition'>" + parameters.opposition + "<label>");
        $('#note').html(note);
    }

    /**
     * Handle the metamorphe use change.
     * @param event The event to handle.
     */
    async _onSelectMetamorphe(event) {
        event.preventDefault();
        const parameters = this.parameters();
        const metamorphe = parameters.metamorphe;
        const difficulty = this.action.difficulty(parameters);
        $('#metamorpheModifier').html("<span>" + metamorphe + "<span>");
        $('#difficulty').html(difficulty + "%");
    }

    /**
     * Handle the click to roll action.
     * @param event The event to handle.
     */
    async _onRoll(event) {
        event.preventDefault();
        await this.close();
        await this.action.roll(this.parameters());
    }

    /**
     * @returns the action parameters.
     */
    parameters() {
        return {
            manoeuver: this._manoeuver(),
            modifier: this._modifier(),
            blessures: this._blessures(),
            fraternite: this._fraternite(),
            approche: this._approche(),
            metamorphe:this._metamorphe(),
            ka: this._ka(),
            opposition: this._opposition(),
            elt: this._elt(),
            opposed: this._opposed(),
            shot: this._shot(6) === true ? 6 : this._shot(5) === true ? 5 : this._shot(4) === true ? 4 : this._shot(3) === true ? 3 : this._shot(2) === true ? 2 : 1,
            mnemos: this._mnemos()
        }
    }

    /**
     * @returns the selected manoeuver.
     */
    _manoeuver() {
        const selector = this.form?.querySelector("#manoeuver");
        return selector?.value;
    }

    /**
     * @returns the current action modifier.
     */
    _modifier() {
        const modifier = parseInt(this.form?.querySelector("#modifier")?.value);
        return isNaN(modifier) ? 0 : modifier;
    }

    /**
     * @returns the current fraternite modifier if activated.
     */
    _fraternite() {
        const selector = this.form?.querySelector("#fraternite");
        const fraternite = selector == null || selector?.value === 'ignore' ? 0 : this.data.fraternite;
        return fraternite;
    }

    /**
     * @returns the current wound modifier if activated.
     */
    _blessures() {
        const selector = this.form?.querySelector("#blessures");
        const blessures = selector?.value === 'ignore' ? 0 : this.data.blessures;
        return blessures;
    }

    /**
     * @returns the optional approche modifier.
     */
    _approche() {
        const selector = this.form?.querySelector("#approche");
        const approche =  selector?.value;
        if (approche == null) return 0;
        const element = approche.replaceAll('NEPH5E.','').replaceAll('pentacle.elements.','');
        return element === 'none' ? 0 : this.object.getKa(element) * 10;
    }

    /**
     * @returns the optional metamorphe modifier.
     */
    _metamorphe() {
        const selector = this.form?.querySelector("#metamorphe");
        const metamorphe = selector == null || selector?.value === 'ignore' ? 0 : this.data.metamorphe;
        return metamorphe;
    }

    /**
     * @returns the sum of activated mnemos modifiers.
     */
    _mnemos() {
        let modifier = 0;
        this.form?.querySelectorAll(".mnemos-modifier").forEach(selector => {
            const value = selector?.value;
            modifier = modifier + (isNaN(value) ? 0 : parseInt(value));
        });
        modifier = modifier * 10;
        return modifier;
    }

    /**
     * @returns the current ka modifier used for invocations.
     */
    _ka() {
        const selector = this.form?.querySelector("#element");
        return this.actor.getKa(selector == null ? 'air' : selector?.value) * 10;
    }

    /**
     * @returns the current opposition used.
     */
    _opposition() {
        const selector = this.form?.querySelector("#opposition");
        return selector?.value;
    }

    /**
     * @returns the current element used.
     */
    _elt() {
        const selector = this.form?.querySelector("#element");
        return selector?.value;
    }

    /**
     * @returns true if opposed action, false for simple action.
     */
    _opposed() {
        return this.data.opposed ? true : this.data.simple ? false : this.form?.querySelector("#rollType")?.value === 'opposed';
    }

    /**
     * @param shot The index of the shot from 1 to 6.
     * @returns true if the shot is checked. 
     */
    _shot(shot) {
        const selector = this.form?.querySelector("#shot"+shot);
        return shot === 1 ? true : selector == null ? false : selector.checked;
    }

}