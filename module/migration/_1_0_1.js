import { CustomHandlebarsHelpers } from "../common/handlebars.js";
import { MigrationTools } from "./migration.js";
import { NephilimItem } from "../item/entity.js";

export class _1_0_1 {

    static async migrate(target) {

        // Initialization
        const msg = "Updating to " + target;
        const size = game.packs.filter(p => p.documentName === 'Item').length
            + game.items.size * 2
            + game.actors.size;
        let migrated = 0;

        // World items
        for (let item of game.items) {
            await _1_0_1.migrate_vecus(item);
            MigrationTools.progress(msg, ++migrated, size);
        }
        for (let item of game.items) {
            await _1_0_1.migrate_items(item);
            MigrationTools.progress(msg, ++migrated, size);
        }

        // Compendium items
        for (let pack of game.packs.filter(p => p.documentName === 'Item')) {
            const wasLocked = pack.locked;
            await pack.configure({ locked: false });
            await pack.migrate();
            const documents = await pack.getDocuments();
            for (let item of documents) {
                await _1_0_1.migrate_vecus(item);
                MigrationTools.progress(msg, ++migrated, size);
            }
            for (let item of documents) {
                await _1_0_1.migrate_items(item);
                MigrationTools.progress(msg, ++migrated, size);
            }
            await pack.configure({ locked: wasLocked });
        }

        // World actors
        for (let actor of game.actors) {
            await _1_0_1.migrate_actors(actor);
            MigrationTools.progress(msg, ++migrated, size);
        }

        game.settings.set("neph5e", "worldTemplateVersion", target);
        ui.notifications.info("Update to " + target + " done");

    }

    static async migrate_vecus(item) {
        switch (item.type) {
            case 'vecu': {
                if (item.system.periode === '') {
                    for (let periode of game.items.filter(p => p.type === 'periode')) {
                        if (periode.system.hasOwnProperty('vecus')) {
                            if (periode.system.vecus.filter(i => i.refid === item.sid).length > 0) {
                                await item.update({ ['system.periode']: periode.sid });
                            }
                        }
                    }
                }
                break;
            }
            default:
                break;
        }
    }

    static async migrate_items(item) {
        switch (item.type) {
            case 'periode': {
                await item.update({ ['system.-=vecus']: null });
                break;
            }
            case 'competence': {
                const system = duplicate(item.system);
                switch (system.inne) {
                    case 'agile':
                        system.element = 'eau';
                        break;
                    case 'endurant':
                        system.element = 'terre';
                        break;
                    case 'fort':
                        system.element = 'feu';
                        break;
                    case 'intelligent':
                        system.element = 'air';
                        break;
                    case 'seduisant':
                        system.element = 'lune';
                        break;
                }
                await item.update({ ['system']: system })
                await item.update({ ['system.-=inne']: null });
                break;
            }
            default:
                break;
        }
    }

    static async migrate_actors(actor) {
        switch (actor.type) {
            case 'figure': {
                for (let periode of actor.system.periodes) {
                    if (periode.hasOwnProperty('vecus')) {
                        for (let vecu of periode.vecus) {
                            if (!actor.items.find(i => i.sid === vecu.refid)) {
                                const v = CustomHandlebarsHelpers.getItem(vecu.refid);
                                if (v != null) {
                                    const item = await _1_0_1.getSource(v);
                                    item.system.degre = vecu.degre;
                                    item = item instanceof Array ? item : [item];
                                    actor.createEmbeddedDocuments("Item", item);
                                }
                            }
                        }
                    }
                }
                const periodes = duplicate(actor.system.periodes);
                for (let i = 0; i < periodes.length; i++) {
                    delete periodes[i].vecus;
                }
                await actor.update({ ['system.-=periodes']: null });
                await actor.update({ ['system.periodes']: periodes });
                await actor.update({ ['system.-=page']: null });
                await actor.update({ ['system.-=data']: null });
                await actor.update({ ['system.alchimie.-=akasha']: null });
                break;
            }
            case 'simulacre': {
                const refid = actor.system?.vecu?.refid;
                if (refid != null) {
                    if (!actor.items.find(i => i.sid === refid)) {
                        const v = CustomHandlebarsHelpers.getItem(refid);
                        if (v != null) {
                            let item = await _1_0_1.getSource(v);
                            item.system.degre = actor.system.vecu.degre;
                            item = item instanceof Array ? item : [item];
                            actor.createEmbeddedDocuments("Item", item);
                        }
                    }
                }
                await actor.update({ ['system.-=vecu']: null });
                break;
            }
            default:
                break;
        }
    }

    static async getSource(vecu) {
        const item = await NephilimItem.fromDropData({ uuid: "Item." + vecu.id });
        return item.toObject();
    }

}