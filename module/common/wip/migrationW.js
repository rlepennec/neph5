import { NephilimItem } from "../item/entity.js";
import { CustomHandlebarsHelpers } from "./handlebars.js.js";

export class MigrationTools {

    /**
     * Migrates all data.
     */
    static async migrate() {

        if (!game.user.isGM) return;

        const worldTemplateVersion = game.settings.get("neph5e", "worldTemplateVersion");

        if (isNewerVersion('1.0.1', worldTemplateVersion)) {
            ui.notifications.info("Mise à jour des données...");
            await MigrationTools.migrateActors('1.0.1', ['figure']);
            //game.settings.set("neph5e", "worldTemplateVersion", '1.0.1');
            ui.notifications.info("Mise à jour effectuée");
        }

    }

    static async migrateActors(version, types) {
        for (let actor of game.actors.filter(a => types.includes(a.type))) {
            console.log(actor.name);
            try {
                const data = actor.toObject();
                console.log(data);
                /*

                const updateData = migrateActorData(a.toObject(), migrationData);
                if (!foundry.utils.isObjectEmpty(updateData)) {
                    console.log(`Migrating Actor document ${a.name}`);
                    await a.update(updateData, { enforceTypes: false });
                }
                */
            } catch (err) {
                err.message = `Failed Nephilim system migration for Actor ${a.name}: ${err.message}`;
                console.error(err);
            }
        }
    }

    static async migrateItems(version, types) {

    }

    static async MigrateActor(version, actor) {
        switch(actor.type) {
            case 'figure':
                switch (version) {
                    case '1.0.1':
                        break;
                    default:
                        break;
                }
                break;
            case 'figurant':
                switch (version) {
                    case '1.0.1':
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }

}