import { NephilimItem } from "../item/entity.js";
import { CustomHandlebarsHelpers } from "./handlebars.js.js";

export class MigrationTools {

    static async migrate() {

        if (!game.user.isGM) return;

        const worldTemplateVersion = game.settings.get("neph5e", "worldTemplateVersion");

        if (isNewerVersion('1.0.1', worldTemplateVersion)) {
            ui.notifications.info("Mise à jour des données...");
            await MigrationTools.migrate_1_0_1();
            game.settings.set("neph5e", "worldTemplateVersion", '1.0.1');
            ui.notifications.info("Mise à jour effectuée");
        }

    }

    /**
     * Miragtion to template version 1.0.1
     *   - Add the periode property to each vecu item
     *   - Delete the vecus property of each periode
     *   - Update each figure
     *   - Update each simulacre 
     */
    static async migrate_1_0_1() {

        // Add the periode property to each vecu item
        for (let item of game.items.filter(i => i.type === 'vecu' && i.data.data.periode === '')) {
            for (let periode of game.items.filter(p => p.type === 'periode')) {
                if (periode.data.data.vecus.filter(i => i.refid === item.data.data.id).length > 0) {
                    await item.update({ ['data.periode']: periode.data.data.id });
                }
            }
        }

        // Delete the vecus property of each periode
        for (let item of game.items.filter(i => i.type === 'periode')) {
            await item.update({ ['data.-=vecus']: null });
        }

        // Replace the inne property by the element property
        for (let item of game.items.filter(i => i.type === 'competence')) {
            const data = duplicate(item.data.data);
            switch (data.inne) {
                case 'agile':
                    data.element = 'eau';
                    break;
                case 'endurant':
                    data.element = 'terre';
                    break;
                case 'fort':
                    data.element = 'feu';
                    break;
                case 'intelligent':
                    data.element = 'air';
                    break;
                case 'seduisant':
                    data.element = 'lune';
                    break;
            }
            await item.update({ ['data']: data })
            await item.update({ ['data.-=inne']: null });
        }

        // Update each figure
        for (let actor of game.actors.filter(a => a.type === 'figure')) {

            // Add vecu items
            for (let periode of actor.data.data.periodes) {
                for (let vecu of periode.vecus) {
                    if (!actor.items.find(i => i.data.data.id === vecu.refid)) {
                        const item = await NephilimItem.fromDropData({
                            id: CustomHandlebarsHelpers.getItem(vecu.refid).id,
                            type: "Item"
                        });
                        let itemData = item.toObject();
                        itemData.data.degre = vecu.degre;
                        itemData = itemData instanceof Array ? itemData : [itemData];
                        actor.createEmbeddedDocuments("Item", itemData)
                    }
                }
            }

            // Delete vecus properties from periode
            const periodes = duplicate(actor.data.data.periodes);
            for (let i = 0; i < periodes.length; i++) {
                delete periodes[i].vecus;
            }
            await actor.update({ ['data.-=periodes']: null });
            await actor.update({ ['data.periodes']: periodes });

            // Delete the page property
            await actor.update({ ['data.-=page']: null });
            await actor.update({ ['data.-=data']: null });
            await actor.update({ ['data.alchimie.-=akasha']: null });

        }

        // Update each simulacre
        for (let actor of game.actors.filter(a => a.type === 'simulacre')) {

            // Add vecu items
            if (!actor.items.find(i => i.data.data.id === actor.data.data.vecu.refid)) {
                const item = await NephilimItem.fromDropData({
                    id: CustomHandlebarsHelpers.getItem(actor.data.data.vecu.refid).id,
                    type: "Item"
                });
                let itemData = item.toObject();
                itemData.data.degre = actor.data.data.vecu.degre;
                itemData = itemData instanceof Array ? itemData : [itemData];
                actor.createEmbeddedDocuments("Item", itemData);
            }

            // Delete the vecu property
            await actor.update({ ['data.-=vecu']: null });

        }

    }



    /*
    static async migrate_world_items(version, types) {
        for (let i of game.items) {
            try {
                const data = migrateItemData(i.toObject(), migrationData);
                if (!foundry.utils.isObjectEmpty(updateData)) {
                    console.log(`Migrating Item document ${i.name}`);
                    await i.update(updateData, { enforceTypes: false });
                }
            } catch (err) {
                err.message = `Failed dnd5e system migration for Item ${i.name}: ${err.message}`;
                console.error(err);
            }
        }
    }*/

    /**
     * Migrates the specified item.
     * @param {*} version The target version of the template.
     * @param {*} item    The item to update.
     * @param {*} items   The collection which contains the item to update.
     * @param {*} data    The data to update.
     * @returns the updated data.
     */
    /*
    static async migrate_world_items(version, items, type) {
        for (let item of items.filter(item.type === type)) {
            let data = null;
            switch(item.type) {
                case 'vecu':
                    data = MigrationTools.migrate_vecu(version, item, items, data);
                    break;
                case 'periode':
                    data = MigrationTools.migrate_periode(version, item, items, data);
                    break;
                default:
                    break;
            }

        }
    }*/

    /**
     * Migrates the specified item.
     * @param {*} version The target version of the template.
     * @param {*} item    The item to update.
     * @param {*} items   The collection which contains the item to update.
     * @param {*} data    The data to update.
     * @returns the updated data.
     */
    /*
    static async migrate_vecu(version, item, items, data) {
        switch (version) {
            case '1.0.1':
                for (let periode of items.filter(p => p.type === 'periode' && p.data.data.vecus.filter(v => v.refid === item.data.data.id).length > 0)) {
                    data["data.periode"] = periode.data.data.id;
                    continue;
                }
                break;
            default:
                data = null;
                break;
        }
        return data;
    }*/

    /**
     * Migrates the specified item.
     * @param {*} version The target version of the template.
     * @param {*} item    The item to update.
     * @param {*} items   The collection which contains the item to update.
     * @param {*} data    The data to update.
     * @returns the updated data.
     */
    /*
    static async migrate_periode(version, item, items, data) {
        switch (version) {
            case '1.0.1':
                data["data.-=vecus"] = null;
                break;
            default:
                data = null;
                break;
        }
        return data;
    }*/

}