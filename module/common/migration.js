export const migrateWorld = async () => {

    // Template undefined -> 1 : 1 Initial
    //                         : 2 Add baton, coupe, denier, epee in actor (tab and options)

    //let templateVersion = game.data.system.data.templateVersion;
    let templateVersion = 2;
    let worldTemplateVersion;
    try{
        worldTemplateVersion = Number(game.settings.get("neph5e", "worldTemplateVersion"))
    }
    catch(e){
        console.error(e);
        worldTemplateVersion = 1;
        console.log("No template version detected... Default to 1")
    }
    if (worldTemplateVersion < templateVersion && game.user.isGM) {
        ui.notifications.info("New template detected; Upgrading the world, please wait...");
        if (worldTemplateVersion < 2) {
            const htmlTemplate = await renderTemplate("systems/neph5e/templates/dialog/migration-warning.html");
            new Dialog({
                title: "WARNING", 
                content: htmlTemplate,
                buttons: {
                    close: {
                        label: "Close"
                    }
                }
            }).render(true);
        }
        for (let actor of game.actors.entities) {
            try {
                const update = migrateActorData(actor.data, worldTemplateVersion);
                if (!isObjectEmpty(update)) {
                    await actor.update(update, {enforceTypes: false});
                }
            } catch (e) {
                console.error(e);
            }
        }
        for (let item of game.items.entities) {
            try {
                const update = migrateItemData(item.data, worldTemplateVersion);
                if (!isObjectEmpty(update)) {
                    await item.update(update, {enforceTypes: false});
                }
            } catch (e) {
                console.error(e);
            }
        }
        for (let scene of game.scenes.entities) {
            try {
                const update = migrateSceneData(scene.data, worldTemplateVersion);
                if (!isObjectEmpty(update)) {
                    await scene.update(update, {enforceTypes: false});
                }
            } catch (err) {
                console.error(err);
            }
        }
        for (let pack of game.packs.filter((p) => p.metadata.package === "world" && ["Actor", "Item", "Scene"].includes(p.metadata.entity))) {
            await migrateCompendium(pack, worldTemplateVersion);
        }
        game.settings.set("neph5e", "worldTemplateVersion", templateVersion);
        ui.notifications.info("Upgrade complete!");
    }
};

const migrateActorData = (actor, worldTemplateVersion) => {
    let update = {};
    if (worldTemplateVersion < 2) {
        if (actor.type === "figure") {
            //update = setValueIfNotExists(update, actor, "data.data.baton.techniques", []);
        }
	};
		
    let itemsChanged = false;
    const items = actor.items.map((item) => {
        const itemUpdate = migrateItemData(item, worldTemplateVersion);
        if (!isObjectEmpty(itemUpdate)) {
            itemsChanged = true;
            return mergeObject(item, itemUpdate, {enforceTypes: false, inplace: false});
        }
        return item;
    });
    if (itemsChanged) {
        update.items = items;
    }
    return update;
};

const migrateItemData = (item, worldTemplateVersion) => {
    let update = {};
    if (worldTemplateVersion < 2) {
        /*
        if (item.type === "weapon") {
            update = setValueIfNotExists(update, item, "data.qualities.bastard", false);
        }
        */
    }
    if (!isObjectEmpty(update)) {
        update.id = item.id;
    }
    return update;
};

const migrateSceneData = (scene, worldTemplateVersion) => {
    const tokens = duplicate(scene.tokens);
    return {
        tokens: tokens.map((tokenData) => {
            if (!tokenData.actorId || tokenData.actorLink || !tokenData.actorData.data) {
                tokenData.actorData = {};
                return tokenData;
            }
            const token = new Token(tokenData);
            if (!token.actor) {
                tokenData.actorId = null;
                tokenData.actorData = {};
            } else if (!tokenData.actorLink && token.data.actorData.items) {
                const update = migrateActorData(token.data.actorData, worldTemplateVersion);
                console.log("ACTOR CHANGED", token.data.actorData, update);
                tokenData.actorData = mergeObject(token.data.actorData, update);
            }
            return tokenData;
        }),
    };
};

export const migrateCompendium = async function (pack, worldTemplateVersion) {
    const entity = pack.metadata.entity;

    await pack.migrate();
    const content = await pack.getContent();

    for (let ent of content) {
        let updateData = {};
        if (entity === "Item") {
            updateData = migrateItemData(ent.data, worldTemplateVersion);
        } else if (entity === "Actor") {
            updateData = migrateActorData(ent.data, worldTemplateVersion);
        } else if (entity === "Scene") {
            updateData = migrateSceneData(ent.data, worldTemplateVersion);
        }
        if (!isObjectEmpty(updateData)) {
            expandObject(updateData);
            updateData["id"] = ent.id;
            await pack.updateEntity(updateData);
        }
    }
};

const setValueIfNotExists = (update, object, property, newValue) => {
    if (typeof(getProperty(object,property)) === 'undefined'){
        update[property] = newValue;
    }
    return(update)
}