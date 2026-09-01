import { AbstractDialog } from "./abstractDialog.js";

export class ActionDialog extends AbstractDialog {

    /**
     * Constructor.
     * @param actor  The emiter of the dialog.
     * @param action The action.
     */
    constructor(actor, action) {
        super(actor);
        this.action = action;
        this.data = null;
        this.mnemos = 0;
    }

    /**
     * @returns the default options to manage the dialog.
     */
    // [V14] DEFAULT_OPTIONS remplace defaultOptions (voir AbstractDialog).
    //       Foundry fusionne automatiquement les DEFAULT_OPTIONS de toute la chaîne
    //       d'héritage : le spread manuel n'est donc pas nécessaire.
    //       La position initiale (width/height) est déclarée dans la clé "position"
    //       et non à la racine des options comme en v12.
    //       Les templates sont déclarés dans static PARTS (voir ci-dessous),
    //       conformément à la convention ApplicationV2.
    static DEFAULT_OPTIONS = {
        classes: ["nephilim", "sheet"],
        // [V14] width et height ne sont plus à la racine des options mais dans "position".
        position: {
            width: 500,
            height: "auto"
        }
    };

    /**
     * @returns the parts of the dialog.
     */
    // [V14] static PARTS est la convention officielle de HandlebarsApplicationMixin
    //       pour déclarer les templates à rendre. Chaque clé est un identifiant de "part"
    //       (ici "main") associé à un chemin de template HBS.
    //       Cela remplace à la fois options.template (FormApplication v12) et
    //       l'ancienne déclaration dans DEFAULT_OPTIONS.parts.
    static PARTS = {
        main: {
            // Template par défaut ; peut être surchargé via withTemplate().
            template: "systems/neph5e/feature/core/action.hbs"
        }
    };

    /**
     * @override
     */
    // [V14] getData() devient _prepareContext() (async). Voir AbstractDialog.
    //       this.object.id devient this.actor.id.
    async _prepareContext(options) {
        const data = foundry.utils.duplicate(this.data);
        data.owner = this.actor.id;
        data.difficulty = this.action.difficulty(this.parameters());
        return data;
    }

    /**
     * @override
     */
    // [V14] activateListeners(html) est remplacé par _onRender(context, options).
    //       Différences majeures :
    //         1. Le paramètre n'est plus un objet jQuery mais le contexte + options V2.
    //         2. Le DOM est accessible via this.element (HTMLElement natif).
    //         3. _onRender est appelé après chaque rendu (y compris les re-renders partiels).
    //       Les helpers _on() et _setText() utilisés ici sont définis dans AbstractDialog
    //       afin d'être disponibles pour toutes les sous-classes.
    _onRender(context, options) {
        super._onRender(context, options);
        // [V14] this.element remplace le paramètre html (jQuery) de activateListeners.
        //       C'est le root HTMLElement de la fenêtre ApplicationV2.
        const html = this.element;

        // [V14] html.find(...).change(...) et .on('input', ...) sont remplacés par
        //       addEventListener via le helper _on() (voir ci-dessous).
        this._on(html, "#modifier",       ["change", "input"], this._onSetModifier);
        this._on(html, "#fraternite",     ["change"],          this._onSelectFraternite);
        this._on(html, "#blessures",      ["change"],          this._onSelectBlessures);
        this._on(html, "#approche",       ["change"],          this._onSelectApproche);
        this._on(html, "#element",        ["change"],          this._onSelectElement);
        this._on(html, "#opposition",     ["change", "input"], this._onSetOpposition);
        this._on(html, "#condition",      ["change"],          this._onSetCondition);
        this._on(html, "#aide",           ["change", "input"], this._onSetAide);
        this._on(html, "#metamorphe",     ["change"],          this._onSelectMetamorphe);
        // [V14] Le dernier argument "true" active querySelectorAll pour les sélecteurs
        //       multiples (classe CSS au lieu d'id).
        this._on(html, ".mnemos-modifier",["change"],          this._onSelectMnemos, true);
        this._on(html, "#roll",           ["click"],           this._onRoll);
        this._on(html, "#details",        ["click"],           this._onDetails);
    }

    /**
     * Handle the details display change.
     * @param event The event to handle.
     */
    async _onDetails(event) {
        event.preventDefault();
        // [V14] $(".hiddable").toggle() (jQuery) est remplacé par classList.toggle().
        //       Requiert que la CSS du système définisse .hidden { display: none }.
        this.element.querySelectorAll(".hiddable").forEach(el => el.classList.toggle("hidden"));
    }

    /**
     * Handle the modifier change.
     * @param event The event to handle.
     */
    async _onSetModifier(event) {
        event.preventDefault();
        const parameters = this.parameters();
        const difficulty = this.action.difficulty(parameters);
        // [V14] $('#difficulty').html(...) remplacé par _setText() (DOM natif, pas jQuery).
        this._setText("#difficulty", difficulty + "%");
        this._setText("#sliderModifier", parameters.modifier);
    }

    /**
     * Handle the fraternite use change.
     * @param event The event to handle.
     */
    async _onSelectFraternite(event) {
        event.preventDefault();
        const parameters = this.parameters();
        // [V14] Même remplacement jQuery → _setText() que dans _onSetModifier.
        this._setText("#fraterniteModifier", parameters.fraternite);
        this._setText("#difficulty", this.action.difficulty(parameters) + "%");
    }

    /**
     * Handle the blessures modifier change.
     * @param event The event to handle.
     */
    async _onSelectBlessures(event) {
        event.preventDefault();
        const parameters = this.parameters();
        // [V14] Même remplacement jQuery → _setText().
        this._setText("#blessuresModifier", parameters.blessures);
        this._setText("#difficulty", this.action.difficulty(parameters) + "%");
    }

    /**
     * Handle the approche change.
     * @param event The event to handle.
     */
    async _onSelectApproche(event) {
        event.preventDefault();
        const parameters = this.parameters();
        // [V14] Même remplacement jQuery → _setText().
        this._setText("#approcheModifier", parameters.approche);
        this._setText("#difficulty", this.action.difficulty(parameters) + "%");
    }

    /**
     * Handle the mnemos change.
     * @param event The event to handle.
     */
    async _onSelectMnemos(event) {
        event.preventDefault();
        // [V14] Même remplacement jQuery → _setText().
        this._setText("#difficulty", this.action.difficulty(this.parameters()) + "%");
    }

    /**
     * Handle the element change.
     * @param event The event to handle.
     */
    async _onSelectElement(event) {
        event.preventDefault();
        // [V14] Même remplacement jQuery → _setText().
        this._setText("#difficulty", this.action.difficulty(this.parameters()) + "%");
    }

    /**
     * Handle the opposition change.
     * @param event The event to handle.
     */
    async _onSetOpposition(event) {
        event.preventDefault();
        const parameters = this.parameters();
        // [V14] Même remplacement jQuery → _setText().
        this._setText("#difficulty",         this.action.difficulty(parameters) + "%");
        this._setText("#sliderOpposition",   parameters.opposition);
        this._setText("#conditionsModifier", this.action.condition(parameters));
        this._setText("#note",               this.action.note(parameters));
    }

    /**
     * Handle the aide change.
     * @param event The event to handle.
     */
    async _onSetAide(event) {
        event.preventDefault();
        const parameters = this.parameters();
        // [V14] Même remplacement jQuery → _setText().
        this._setText("#difficulty",   this.action.difficulty(parameters) + "%");
        this._setText("#sliderAide",   parameters.aide);
        this._setText("#aideModifier", this.action.aide(parameters));
    }

    /**
     * Handle the condition change.
     * @param event The event to handle.
     */
    async _onSetCondition(event) {
        event.preventDefault();
        const parameters = this.parameters();
        // [V14] Même remplacement jQuery → _setText().
        this._setText("#conditionsModifier", this.action.condition(parameters));
        this._setText("#difficulty",         this.action.difficulty(parameters) + "%");
    }

    /**
     * Handle the metamorphe use change.
     * @param event The event to handle.
     */
    async _onSelectMetamorphe(event) {
        event.preventDefault();
        const parameters = this.parameters();
        // [V14] Même remplacement jQuery → _setText().
        this._setText("#metamorpheModifier", parameters.metamorphe);
        this._setText("#difficulty",         this.action.difficulty(parameters) + "%");
    }

    async _onRoll(event) {
        event.preventDefault();
        const parameters = this.parameters();   // lire AVANT de fermer
        await this.close();
        await this.action.roll(parameters);
    }

    /**
     * @returns the action parameters.
     */
    parameters() {
        return {
            manoeuver:  this._manoeuver(),
            modifier:   this._modifier(),
            blessures:  this._blessures(),
            fraternite: this._fraternite(),
            approche:   this._approche(),
            metamorphe: this._metamorphe(),
            ka:         this._ka(),
            opposition: this._opposition(),
            elt:        this._elt(),
            opposed:    this._opposed(),
            shot:       this._shot(6) ? 6 : this._shot(5) ? 5 : this._shot(4) ? 4 : this._shot(3) ? 3 : this._shot(2) ? 2 : 1,
            mnemos:     this._mnemos(),
            condition:  this._condition(),
            aide:       this._aide()
        };
    }

    /**
     * @returns the selected manoeuver.
     */
    _manoeuver() {
        // [V14] this.form?.querySelector() remplacé par this.element?.querySelector().
        //       this.form n'est plus exposé par ApplicationV2 ; this.element est le
        //       root HTMLElement de la fenêtre, qui contient le formulaire.
        return this.element?.querySelector("#manoeuver")?.value;
    }

    /**
     * @returns the current action modifier.
     */
    _modifier() {
        // [V14] this.form → this.element (voir _manoeuver).
        const modifier = parseInt(this.element?.querySelector("#modifier")?.value);
        return isNaN(modifier) ? 0 : modifier;
    }

    /**
     * @returns the current fraternite modifier if activated.
     */
    _fraternite() {
        // [V14] this.form → this.element (voir _manoeuver).
        const selector = this.element?.querySelector("#fraternite");
        return selector == null || selector.value === "ignore" ? 0 : this.data.fraternite;
    }

    /**
     * @returns the current wound modifier if activated.
     */
    _blessures() {
        // [V14] this.form → this.element (voir _manoeuver).
        const selector = this.element?.querySelector("#blessures");
        return selector?.value === "ignore" ? 0 : this.data.blessures;
    }

    /**
     * @returns the optional approche modifier.
     */
    _approche() {
        // [V14] this.form → this.element (voir _manoeuver).
        // [V14] this.object.getKa() → this.actor.getKa() : this.object n'existe plus
        //       en V2 (c'était le document passé à super() en FormApplication).
        const selector = this.element?.querySelector("#approche");
        // La valeur de l'option est désormais la clef du ka ('noyau', 'air',
        // 'ka'), celle-là même qu'attend getKa(). Le retrait du préfixe
        // 'NEPHILIM.' qui figurait ici compensait le fait que le gabarit
        // émettait un chemin i18n ; il n'a plus lieu d'être, et il masquait
        // que 'NEPHILIM.luneNoire' ne redonnait pas la clef 'noyau'.
        const approche = selector?.value;
        if (approche == null) return 0;
        return approche === "none" ? 0 : this.actor.getKa(approche) * 10;
    }

    /**
     * @returns the optional metamorphe modifier.
     */
    _metamorphe() {
        // [V14] this.form → this.element (voir _manoeuver).
        const selector = this.element?.querySelector("#metamorphe");
        return selector == null || selector.value === "ignore" ? 0 : this.data.metamorphe;
    }

    /**
     * @returns the sum of activated mnemos modifiers.
     */
    _mnemos() {
        // [V14] this.form → this.element (voir _manoeuver).
        let modifier = 0;
        this.element?.querySelectorAll(".mnemos-modifier").forEach(selector => {
            const value = selector?.value;
            modifier += isNaN(value) ? 0 : parseInt(value);
        });
        return modifier * 10;
    }

    /**
     * @returns the current ka modifier used for invocations.
     */
    _ka() {
        // [V14] this.form → this.element (voir _manoeuver).
        // [V14] this.actor remplace this.actor (déjà correct en v12 ici, pas de changement).
        const selector = this.element?.querySelector("#element");
        return this.actor.getKa(selector == null ? "air" : selector.value) * 10;
    }

    /**
     * @returns the current opposition used.
     */
    _opposition() {
        // [V14] this.form → this.element (voir _manoeuver).
        return this.element?.querySelector("#opposition")?.value;
    }

    /**
     * @returns the current condition used.
     */
    _condition() {
        // [V14] this.form → this.element (voir _manoeuver).
        return this.element?.querySelector("#condition")?.value;
    }

    /**
     * @returns the current aide used.
     */
    _aide() {
        // [V14] this.form → this.element (voir _manoeuver).
        return this.element?.querySelector("#aide")?.value;
    }

    /**
     * @returns the current element used.
     */
    _elt() {
        // [V14] this.form → this.element (voir _manoeuver).
        return this.element?.querySelector("#element")?.value;
    }

    /**
     * @returns true if opposed action, false for simple action.
     */
    _opposed() {
        // [V14] this.form → this.element (voir _manoeuver).
        return this.data.opposed ? true
             : this.data.simple  ? false
             : this.element?.querySelector("#rollType")?.value === "opposed";
    }

    /**
     * @param shot The index of the shot from 1 to 6.
     * @returns true if the shot is checked.
     */
    _shot(shot) {
        // [V14] this.form → this.element (voir _manoeuver).
        const selector = this.element?.querySelector("#shot" + shot);
        return shot === 1 ? true : selector == null ? false : selector.checked;
    }

}