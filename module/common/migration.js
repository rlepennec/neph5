import { NephilimItem } from "../item/entity.js";
import { CustomHandlebarsHelpers } from "./handlebars.js";

export class MigrationTools {

    static async migrate() {

        if (!game.user.isGM) return;

        const worldTemplateVersion = game.settings.get("neph5e", "worldTemplateVersion");

        if (isNewerVersion('1.0.1', worldTemplateVersion)) {
            ui.notifications.info("Mise à jour des données vers 1.0.1 ...");
            await MigrationTools.migrate_1_0_1();
            game.settings.set("neph5e", "worldTemplateVersion", '1.0.1');
            ui.notifications.info("Mise à jour vers 1.0.1 effectuée");
        }

        if (isNewerVersion('1.0.2', worldTemplateVersion)) {
            ui.notifications.info("Mise à jour des données vers 1.0.2 ...");
            await MigrationTools.migrate_1_0_2();
            game.settings.set("neph5e", "worldTemplateVersion", '1.0.2');
            ui.notifications.info("Mise à jour vers 1.0.2 effectuée");
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
                if (periode.data.data.hasOwnProperty('vecus')) {
                    if (periode.data.data.vecus.filter(i => i.refid === item.data.data.id).length > 0) {
                        await item.update({ ['data.periode']: periode.data.data.id });
                    }
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

        ui.notifications.info("Mise à jour des objects du monde effectuée");

        // Update items of compendium
        for (let pack of game.packs.filter(p => p.documentName === 'Item')) {

            const wasLocked = pack.locked;
            await pack.configure({ locked: false });
            await pack.migrate();
            const documents = await pack.getDocuments();

            // Update vecu
            for (let item of documents.filter(i => i.type === 'vecu' && i.data.data.periode === '')) {
                for (let periode of documents.filter(p => p.type === 'periode')) {
                    if (periode.data.data.hasOwnProperty('vecus')) {
                        if (periode.data.data.vecus.filter(i => i.refid === item.data.data.id).length > 0) {
                            await item.update({ ['data.periode']: periode.data.data.id });
                            break;
                        }
                    }
                }
            }

            // Update periode
            for (let item of documents.filter(i => i.type === 'periode')) {
                await item.update({ ['data.-=vecus']: null });
            }

            // Update competence
            for (let item of documents.filter(i => i.type === 'competence')) {
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

            // Apply the original locked status for the pack
            await pack.configure({ locked: wasLocked });

            ui.notifications.info("Mise à jour des objects du pack " + pack.name + " effectuée");

        }

        // Update each figure
        for (let actor of game.actors.filter(a => a.type === 'figure')) {

            // Add vecu items
            for (let periode of actor.data.data.periodes) {
                if (periode.hasOwnProperty('vecus')) {
                    for (let vecu of periode.vecus) {
                        if (!actor.items.find(i => i.data.data.id === vecu.refid)) {
                            const v = CustomHandlebarsHelpers.getItem(vecu.refid);
                            if (v !== undefined) {
                                const item = await NephilimItem.fromDropData({
                                    id: v.id,
                                    type: "Item"
                                });
                                let itemData = item.toObject();
                                itemData.data.degre = vecu.degre;
                                itemData = itemData instanceof Array ? itemData : [itemData];
                                actor.createEmbeddedDocuments("Item", itemData);
                            }
                        }
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
                const v = CustomHandlebarsHelpers.getItem(actor.data.data.vecu.refid);
                if (v !== undefined) {
                    const item = await NephilimItem.fromDropData({
                        id: v.id,
                        type: "Item"
                    });
                    let itemData = item.toObject();
                    itemData.data.degre = actor.data.data.vecu.degre;
                    itemData = itemData instanceof Array ? itemData : [itemData];
                    actor.createEmbeddedDocuments("Item", itemData);
                }
            }

            // Delete the vecu property
            await actor.update({ ['data.-=vecu']: null });

        }

        ui.notifications.info("Mise à jour des acteurs du monde effectuée");

    }

    /**
     * Miragtion to template version 1.0.2
     *   - Update each rite
     */
     static async migrate_1_0_2() {

        // Delete some properties of each rite
        for (let item of game.items.filter(i => i.type === 'rite')) {
            await item.update({ ['data.-=voie']: null });
            await item.update({ ['data.-=duree']: null });
            await item.update({ ['data.-=degre']: null });
        }

        ui.notifications.info("Mise à jour des objects du monde effectuée");

        // Update items of compendium
        for (let pack of game.packs.filter(p => p.documentName === 'Item')) {

            const wasLocked = pack.locked;
            await pack.configure({ locked: false });
            await pack.migrate();
            const documents = await pack.getDocuments();

            // Update rite
            for (let item of documents.filter(i => i.type === 'rite')) {
                await item.update({ ['data.-=voie']: null });
                await item.update({ ['data.-=duree']: null });
                await item.update({ ['data.-=degre']: null });
            }

            ui.notifications.info("Mise à jour des objects du pack " + pack.name + " effectuée");

        }

    }

}