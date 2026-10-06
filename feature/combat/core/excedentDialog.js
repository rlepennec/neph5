import { AbstractDialog } from "../../core/abstractDialog.js";

/**
 * Fenêtre de répartition des degrés de marge au-delà de 10 (voir Excedent). Même cadre et
 * même apparence que les dialogues de combat : deux valeurs cerclées, dommages à gauche et
 * malus à droite, et deux flèches qui font passer un degré de l'une à l'autre. À
 * l'ouverture, tous les degrés sont à gauche.
 */
export class ExcedentDialog extends AbstractDialog {

    static DEFAULT_OPTIONS = {
        classes: ["nephilim", "sheet"],
        position: {
            width: 500,
            height: "auto"
        },
        actions: {
            gauche: ExcedentDialog._onGauche,
            droite: ExcedentDialog._onDroite,
            valider: ExcedentDialog._onValider
        }
    };

    static PARTS = {
        main: {
            template: "systems/neph5e/feature/combat/core/excedent.hbs"
        }
    };

    /**
     * Constructor.
     * @param actor  L'acteur qui répartit sa marge.
     * @param points Le nombre de degrés à répartir.
     * @param role   Excedent.ATTAQUE ou Excedent.DEFENSE : les libellés des deux choix.
     */
    constructor(actor, points, role) {
        super(actor);
        this.points = points;
        this.role = role;
        this.dommages = points;
        this.reponse = new Promise(resolve => this.resoudre = resolve);
    }

    /**
     * Ouvre la fenêtre et attend sa fermeture.
     * @returns { dommages, malus } tels que répartis à la fermeture.
     */
    static async repartir(actor, points, role) {
        const dialog = new ExcedentDialog(actor, points, role).withTitle("Marge de réussite");
        await dialog.render(true);
        return dialog.reponse;
    }

    /**
     * @override
     */
    async _prepareContext(options) {
        const malus = this.points - this.dommages;
        return {
            actor: this.actor,
            sentence: this.actor.name + " obtient " + this.points + " degré(s) de marge au-delà de 10",
            role: this.role,
            dommages: this.dommages,
            malus: malus,
            versGauche: this.dommages < this.points,
            versDroite: this.dommages > 0
        };
    }

    /**
     * Un degré passe de droite (malus) à gauche (dommages).
     */
    static async _onGauche(event, target) {
        if (this.dommages < this.points) {
            this.dommages++;
            await this.render();
        }
    }

    /**
     * Un degré passe de gauche (dommages) à droite (malus).
     */
    static async _onDroite(event, target) {
        if (this.dommages > 0) {
            this.dommages--;
            await this.render();
        }
    }

    static async _onValider(event, target) {
        await this.close();
    }

    /**
     * Fermée par Valider ou par la croix, la fenêtre rend la répartition affichée.
     * @override
     */
    _onClose(options) {
        super._onClose(options);
        this.resoudre({ dommages: this.dommages, malus: this.points - this.dommages });
    }

}
