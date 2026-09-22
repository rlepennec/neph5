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
        // Tirer d'ordinaire ; mais au-delà du premier tir d'un tir multiple ou d'une salve,
        // l'action s'ouvre sur la seule manœuvre encore permise (voir Distance.initializeRoll).
        this.defaultManoeuver = action.manoeuver?.id ?? Tirer.ID;
    }

    /**
     * @override
     * CombatDialog calcule l'impact avec Standard, sans incidence tant que la manœuvre par
     * défaut est Tirer (même impact). Ce n'est plus vrai quand le dialogue s'ouvre sur une
     * salve, dont l'impact est majoré : la description doit porter le sien.
     */
    async _prepareContext(options) {
        const data = await super._prepareContext(options);
        data.impact = this.action.impact(this.defaultManoeuver);
        data.description = this.getManoeuverDescription(this.defaultManoeuver, data.impact, data.absorption);
        return data;
    }

    _onRender(context, options) {
        super._onRender(context, options);
        this._setText("#manoeuverModifier", this.action.manoeuverModifier(this.parameters()));
        this._showShots();
    }

    /**
     * Handle the manoeuver change.
     * @param event The event to handle.
     */
    async _onSelectManoeuver(event) {
        await super._onSelectManoeuver(event);
        this._showShots();
    }

    /**
     * Affiche la cadence de tir de la manœuvre courante : une case par tir possible dans le
     * round (une par entrée de `shots`), cochées jusqu'au tir en cours. Purement indicatif :
     * le rang du tir se lit dans la chronologie du round, ces cases ne se saisissent pas.
     */
    _showShots() {
        const manoeuver = this.action.manoeuver;
        if (manoeuver == null) return;
        const tirs = manoeuver.shots?.length ?? 0;
        const courant = manoeuver.played(this.action) + 1;
        for (let shot = 1; shot < 6; shot++) {
            this.element?.querySelector('#shot-' + shot)?.classList.toggle("shown", tirs > 1 && shot <= tirs);
            const coche = this.element?.querySelector('#shot' + shot);
            if (coche) coche.checked = shot <= courant;
        }
    }

}
