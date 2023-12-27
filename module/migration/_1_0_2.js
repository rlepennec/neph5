import { MigrationTools } from "./migration.js";

export class _1_0_2 {

     static async migrate(target) {

        // Initialization
        const msg = "Updating to " + target;
        const size = game.packs.filter(p => p.documentName === 'Item').length + game.items.size;
        let migrated = 0;

        // World items
        for (let item of game.items) {
            await _1_0_2.migrate_items(item);
            MigrationTools.progress(msg, ++migrated, size);
        }

        // Compendium items
        for (let pack of game.packs.filter(p => p.documentName === 'Item')) {
            const wasLocked = pack.locked;
            await pack.configure({ locked: false });
            await pack.migrate();
            const documents = await pack.getDocuments();
            for (let item of documents) {
                await _1_0_2.migrate_items(item);
                MigrationTools.progress(msg, ++migrated, size);
            }
            await pack.configure({ locked: wasLocked });
        }

        game.settings.set("neph5e", "worldTemplateVersion", target);
        ui.notifications.info("Update to " + target + " done");

    }

    static async migrate_items(item) {
        switch (item.type) {
            case 'rite': {
                await item.update({ ['system.-=voie']: null });
                await item.update({ ['system.-=duree']: null });
                await item.update({ ['system.-=degre']: null });
                break;
            }
            default:
                break;
        }
    }

}