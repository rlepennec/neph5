import { _1_0_1 } from "./_1_0_1.js";
import { _1_0_2 } from "./_1_0_2.js";
import { _1_0_3 } from "./_1_0_3.js";
import { _1_0_4 } from "./_1_0_4.js";
import { _1_0_5 } from "./_1_0_5.js";
import { _1_0_6 } from "./_1_0_6.js";

export class MigrationTools {

    /**
     * @param value The value to convert. 
     * @returns a boolean value.
     */
    static toBoolean(value) {
        return value != null ? value : false;
    }

    /**
     * @param value The value to convert. 
     * @returns a integer value.
     */
    static toInteger(value) {
        return value != null ? parseInt(value) : 0;
    }

    /**
     * La barre en cours, et le libellé qui l'a ouverte.
     *
     * [V14] SceneNavigation.displayProgressBar est déprécié depuis la v13 et
     * sera RETIRÉ en v15 ; il émettait un avertissement à chaque appel, soit
     * plusieurs milliers par migration. Son remplaçant est une notification de
     * progression, qui n'est pas sans état : il faut conserver l'objet rendu
     * par ui.notifications.info(..., { progress: true }) et l'actualiser.
     * On en ouvre donc une par libellé, réutilisée tant qu'il ne change pas —
     * une migration qui change de libellé ouvre une nouvelle barre.
     */
    static #barre = null;
    static #libelle = null;

    /**
     * Display the progress bar.
     * @param label     The title of the bar.
     * @param iteration The current iteration.
     * @param size      The maximum number of iteration.
     */
    static progress(label, iteration, size) {

        if (MigrationTools.#libelle !== label) {
            MigrationTools.#libelle = label;
            MigrationTools.#barre = ui.notifications.info(label, { progress: true });
        }

        // Le remplaçant attend une FRACTION entre 0 et 1, là où
        // displayProgressBar attendait un pourcentage entre 0 et 100.
        MigrationTools.#barre?.update({
            pct: size > 0 ? iteration / size : 1,
            message: label
        });
    }

    /**
     * Display a information content.
     */
    static async important() {

        const content = await renderTemplate("systems/neph5e/module/migration/important.html");
        new Dialog({
            title: "Important", 
            content: content,
            buttons: {
                close: {
                    label: "Fermer"
                }
            }
        }, {
            width: 600,
            height: 520
        }).render(true);

    }

    /**
     * Process to full migration.
     */
    static async migrate() {

        if (!game.user.isGM) return;

        const worldTemplateVersion = game.settings.get("neph5e", "worldTemplateVersion");

        if (foundry.utils.isNewerVersion('1.0.1', worldTemplateVersion)) {
            await _1_0_1.migrate('1.0.1');
        }

        if (foundry.utils.isNewerVersion('1.0.2', worldTemplateVersion)) {
            await _1_0_2.migrate('1.0.2');
        }

        if (foundry.utils.isNewerVersion('1.0.3', worldTemplateVersion)) {
            await _1_0_3.migrate('1.0.3');
        }

        if (foundry.utils.isNewerVersion('1.0.4', worldTemplateVersion)) {
            await _1_0_4.migrate('1.0.4');
        }

        if (foundry.utils.isNewerVersion('1.0.5', worldTemplateVersion)) {
            await _1_0_5.migrate('1.0.5');
        }

        if (foundry.utils.isNewerVersion('1.0.6', worldTemplateVersion)) {
            await _1_0_6.migrate('1.0.6');
        }

        if (game.settings.get('neph5e', 'note')) {
            await MigrationTools.important();
        }

    }

}