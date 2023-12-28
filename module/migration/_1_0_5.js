import { MigrationTools } from "./migration.js";

export class _1_0_5 {

    static async migrate(target) {

        // Initialization
        const msg = "Updating to " + target;
        const size = game.actors.length;
        let migrated = 0;

        // Update each mnemos in embedded vecu item in world actors
        for (let actor of game.actors) {
            for (let item of actor.items.filter(i => i.type === 'vecu')) {
                await _1_0_5.migrate_vecu(item);
            }
            MigrationTools.progress(msg, ++migrated, size);
        }

        game.settings.set("neph5e", "worldTemplateVersion", target);
        ui.notifications.info("Update to " + target + " done");
    }

    static async migrate_vecu(item) {
        const system = duplicate(item.system);
        system.mnemos = [];
        let index = 1;
        for (let mnemos of item.system.mnemos) {
            system.mnemos.push({
                name: "Mnemos " + index,
                degre: 0,
                description: mnemos,
            })
        }
        await item.update({ ['system']: system });
    }

}