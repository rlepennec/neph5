import { _1_0_1 } from "./_1_0_1.js";
import { _1_0_2 } from "./_1_0_2.js";
import { _1_0_3 } from "./_1_0_3.js";

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
     * Display the progress bar.
     * @param label     The title of the bar.
     * @param iteration The current iteration.
     * @param size      The maximum number of iteration.
     */
    static progress(label, iteration, size) {
        SceneNavigation.displayProgressBar({
            label: label,
            pct: Math.round(iteration * 100 / size)
        });
    }

    /**
     * Process to full migration.
     */
    static async migrate() {

        if (!game.user.isGM) return;

        const worldTemplateVersion = game.settings.get("neph5e", "worldTemplateVersion");

        if (isNewerVersion('1.0.1', worldTemplateVersion)) {
            await _1_0_1.migrate('1.0.1');
        }

        if (isNewerVersion('1.0.2', worldTemplateVersion)) {
            await _1_0_2.migrate('1.0.2');
        }

        if (isNewerVersion('1.0.3', worldTemplateVersion)) {
            await _1_0_3.migrate('1.0.3');
        }

    }

}