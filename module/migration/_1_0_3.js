import { Constants } from "../common/constants.js";
import { EmbeddedItem } from "../common/embeddedItem.js";
import { MigrationTools } from "./migration.js";

export class _1_0_3 {

    static async migrate(target) {

        // Display migration warning
        const content = await renderTemplate("systems/neph5e/module/migration/warning.html");
        new Dialog({
            title: "Attention migration des données du monde", 
            content: content,
            buttons: {
                close: {
                    label: "Fermer",
                    callback: async () => _1_0_3._migrate(target)
                }
            }
        }).render(true);

    }

    static async _migrate(target) {

        // Initialization
        const msg = "Updating to " + target;
        const size = game.packs.filter(p => p.documentName === 'Item').length
            + game.macros.size
            + game.items.size
            + game.actors.size
            + game.scenes.size
            + game.combats.size;
        let migrated = 0;

        // Remove combats
        for (let combat of game.combats) {
            await game.combats.delete(combat.id);
            MigrationTools.progress(msg, ++migrated, size);
        }

        // World macros
        for (let item of game.macros) {
            await _1_0_3.migrate_images(item);
            MigrationTools.progress(msg, ++migrated, size);
        }

        // World items
        for (let item of game.items) {
            await _1_0_3.migrate_images(item);
            await _1_0_3.migrate_items(item);
            MigrationTools.progress(msg, ++migrated, size);
        }

        // World actors
        for (let actor of game.actors) {
            for (let item of actor.items) {
                await _1_0_3.migrate_images(item);
            }
            await _1_0_3.migrate_actors(actor);
            MigrationTools.progress(msg, ++migrated, size);
        }

        // Remove scenes tokens
        for (let scene of game.scenes) {
            for (let token of scene.tokens) {
                await scene.deleteEmbeddedDocuments('Token', [token.id]);
            }
            MigrationTools.progress(msg, ++migrated, size);
        }

        // Compendium items
        for (let pack of game.packs.filter(p => p.documentName === 'Item')) {
            const wasLocked = pack.locked;
            await pack.configure({ locked: false });
            await pack.migrate();
            const documents = await pack.getDocuments();
            for (let item of documents) {
                await _1_0_3.migrate_images(item);
                await _1_0_3.migrate_items(item);
                MigrationTools.progress(msg, ++migrated, size);
            }
            await pack.configure({ locked: wasLocked });
        }

        game.settings.set("neph5e", "worldTemplateVersion", target);
        ui.notifications.info("Update to " + target + " done");

    }

    static async migrate_images(item) {
        if (item.img.indexOf("systems/neph5e/icons/") !== -1) {
            let img = item.img
                .replaceAll("systems/neph5e/icons/", "systems/neph5e/assets/icons/")
                .replaceAll(".jpg", ".webp")
                .replaceAll(".png", ".webp");
            await item.update({ ['img']: img });
        }
    }

    static async migrate_items(item) {
        switch (item.type) {
            case 'arme':

                // Fix used
                switch (item.system.used) {
                    case 'false':
                        await item.update({ ['system.used']: false });
                        break;
                    case 'true':
                        await item.update({ ['system.used']: true });
                        break;
                }

                // Replace skill by type
                const type = item.system.skill;
                await item.update({ ['system.skill']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.type']: (type === Constants.LOURDE ? Constants.FEU : type) });

                // Replace skilluuid by competence
                const skilluuid = item.system.skilluuid;
                await item.update({ ['system.skilluuid']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.competence']: skilluuid });

                // Move defense
                const defense = item.system.melee.defense;
                await item.update({ ['system.melee.defense']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.defense']: defense });
                
                // Move salve
                const salve = item.system.ranged.actions.salve;
                await item.update({ ['system.ranged.actions.salve']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.salve']: salve });

                // Move rafale
                const rafale = item.system.ranged.actions.rafale;
                await item.update({ ['system.ranged.actions.rafale']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.rafale']: rafale });

                // Move ammunition
                const ammunition = item.system.ranged.ammunition;
                await item.update({ ['system.ranged.ammunition']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.ammunition']: ammunition });

                // Move munitions
                const munitions = item.system.ranged.munitions;
                await item.update({ ['system.ranged.munitions']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.munitions']: munitions });

                // Replace utilise by tire
                const tire = item.system.ranged.utilise;
                await item.update({ ['system.ranged.utilise']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.tire']: tire });

                // Move visee
                const visee = item.system.ranged.visee;
                await item.update({ ['system.ranged.visee']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.visee']: visee });

                // Replace target by cible
                const cible = item.system.ranged.target;
                await item.update({ ['system.ranged.target']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.cible']: cible });

                // Remove some properties
                await item.update({ ['system.melee.blocage']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.melee']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.ranged.perce']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.ranged.vitesse']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.ranged.actions.tirer']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.ranged.actions']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.ranged.reload']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.ranged']: new foundry.data.operators.ForcedDeletion() });

                break;

            case 'armure': {
                switch (item.system.used) {
                    case 'false':
                        await item.update({ ['system.used']: false });
                        break;
                    case 'true':
                        await item.update({ ['system.used']: true });
                        break;
                }
                await item.update({ ['system.contact']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.trait']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.feu']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.bouclier']: new foundry.data.operators.ForcedDeletion() });
                break;
            }
            case 'chute': {
                await item.update({ ['system.actif']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.periode']: new foundry.data.operators.ForcedDeletion() });
                break;
            }
            case 'passe': {
                await item.update({ ['system.actif']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.periode']: new foundry.data.operators.ForcedDeletion() });
                break;
            }
            case 'vecu': {
                const system = foundry.utils.duplicate(item.system);
                system.competences = system.competences.map(c => c?.refid);
                await item.update({ ['system']: system });
                await item.update({ ['system.actif']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.degre']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.mnemos']: new foundry.data.operators.ForcedDeletion() });
                break;
            }
            case 'sort': {
                const system = foundry.utils.duplicate(item.system);
                system.voies = system.voies.map(c => c?.refid);
                await item.update({ ['system']: system });
                break;
            }
            case 'invocation': {
                await item.update({ ['system.feal']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.allie']: new foundry.data.operators.ForcedDeletion() });
                break;
            }
            case 'formule': {
                const system = foundry.utils.duplicate(item.system);
                system.variantes = system.variantes.map(c => c?.refid);
                system.catalyseurs = system.catalyseurs.map(c => c?.refid);
                await item.update({ ['system']: system });
                break;
            }
            case 'science': {
                const key = item.system.ref;
                await item.update({ ['system.ref']: new foundry.data.operators.ForcedDeletion() });
                await item.update({ ['system.key']: key });
                await item.update({ ['system.description']: "" });
                break;
            }
            default:
                break;
        }

    }

    static async migrate_actors(actor) {

        switch (actor.type) {

            case 'simulacre': {

                const soleil = foundry.utils.duplicate(actor.system.soleil);
                await actor.update({ ['type']: 'figurant' });
                await actor.update({ ['system.agile']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.endurant']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.fort']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.intelligent']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.seduisant']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.fortune']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.savant']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.sociable']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.soleil']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.menace']: 0 });
                await actor.update({ ['system.ka']: 0 });
                await actor.update({ ['system.ka']: soleil });
                await actor.update({ ['system.dommage.physique.cases']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.dommage.physique.choc']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.dommage.magique.cases']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.dommage.magique.choc']: new foundry.data.operators.ForcedDeletion() });

                // Update vecus
                for (let item of actor.items.filter(i => i.type === 'vecu')) {
                    const system = foundry.utils.duplicate(item.system);
                    system.competences = system.competences.map(c => c?.refid);
                    await item.update({ ['system']: system });
                    await item.update({ ['system.actif']: new foundry.data.operators.ForcedDeletion() });
                    await item.update({ ['system.description']: new foundry.data.operators.ForcedDeletion() });
                    await item.update({ ['system.element']: new foundry.data.operators.ForcedDeletion() });
                }

                break;
            }

            case 'figurant': {

                await actor.update({ ['system.dommage.physique.cases']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.dommage.physique.choc']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.dommage.magique.cases']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.dommage.magique.choc']: new foundry.data.operators.ForcedDeletion() });

                break;
            }

            case 'figure': {

                // The default periode to attach all focus
                const defaultPeriode = actor.system.periodes.find(p => p.refid != null);
                if (defaultPeriode == null) {
                    console.error("No default periode to attach focus for the actor " + actor.name);
                }

                // Sorts
                for (let actorValue of actor.system.magie.sorts) {
                    await new EmbeddedItem(actor, actorValue.refid)
                        .withContext("Migration 1.0.3 of a sort")
                        .withoutNotCreatedError()
                        .withData("periode", defaultPeriode?.refid)
                        .withData("focus",
                            MigrationTools.toBoolean(actorValue.focus))
                        .withData("status",
                            MigrationTools.toBoolean(actorValue.tatoue) === true ? Constants.TATOUE :
                            MigrationTools.toBoolean(actorValue.appris) === true ? Constants.APPRIS : Constants.TATOUE)
                        .withoutData('description', 'cercle', 'element', 'voies', 'degre', 'portee', 'duree')
                        .create();
                }

                // Magie
                if (actor.system.magie.voie?.refid != null) {
                    await new EmbeddedItem(actor, actor.system.magie.voie.refid)
                        .withContext("Migration 1.0.3 of a voie magique")
                        .withoutNotCreatedError()
                        .withoutData('description')
                        .create();
                }

                // Invocations
                for (let actorValue of actor.system.kabbale.invocations) {
                    await new EmbeddedItem(actor, actorValue.refid)
                        .withContext("Migration 1.0.3 of an invocation")
                        .withoutNotCreatedError()
                        .withData("periode", defaultPeriode?.refid)
                        .withData("focus",
                            MigrationTools.toBoolean(actorValue.focus))
                        .withData("pacte",
                            MigrationTools.toBoolean(actorValue.pacte))
                        .withData("status",
                            MigrationTools.toBoolean(actorValue.tatoue) === true ? Constants.TATOUE :
                            MigrationTools.toBoolean(actorValue.appris) === true ? Constants.APPRIS : Constants.TATOUE)
                        .withoutData('description', 'sephirah', 'monde', 'element', 'degre', 'portee', 'duree', 'visibilite')
                        .create();
                }

                // Ordonnances
                if (actor.system.kabbale?.ordonnances != null) {
                    for (let actorValue of actor.system.kabbale.ordonnances) {
                        await new EmbeddedItem(actor, actorValue.refid)
                            .withContext("Migration 1.0.3 of an ordonnance")
                            .withoutNotCreatedError()
                            .withData("periode", defaultPeriode?.refid)
                            .withoutData('description', 'monde')
                            .create();
                    }
                }

                // Formules
                for (let actorValue of actor.system.alchimie.formules) {
                    await new EmbeddedItem(actor, actorValue.refid)
                        .withContext("Migration 1.0.3 of a formule")
                        .withoutNotCreatedError()
                        .withData("periode", defaultPeriode?.refid)
                        .withData("focus",
                            MigrationTools.toBoolean(actorValue.focus))
                        .withData("quantite",
                            MigrationTools.toInteger(actorValue.quantite))
                        .withData("transporte",
                            MigrationTools.toInteger(actorValue.transporte))
                        .withData("status",
                            MigrationTools.toBoolean(actorValue.tatoue) === true ? Constants.TATOUE :
                            MigrationTools.toBoolean(actorValue.appris) === true ? Constants.APPRIS : Constants.TATOUE)
                        .withoutData('description', 'degre', 'cercle', 'enonce', 'substance', 'elements', 'aire', 'duree', 'catalyseurs', 'variantes')
                        .create();
                }

                // Alchimie
                if (actor.system.alchimie.voie?.refid != null) {
                    await new EmbeddedItem(actor, actor.system.alchimie.voie.refid)
                        .withContext("Migration 1.0.3 of a voie alchimique")
                        .withoutNotCreatedError()
                        .withoutData('description')
                        .create();
                }

                // Catalyseur
                for (let actorValue of actor.system.alchimie.catalyseurs) {
                    await new EmbeddedItem(actor, actorValue.refid)
                        .withContext("Migration 1.0.3 of a catalyseur")
                        .withoutNotCreatedError()
                        .withoutData('description')
                        .create();
                }

                // Materiae Primae
                for (let actorValue of actor.system.alchimie.materiae) {
                    await new EmbeddedItem(actor, actorValue.refid)
                        .withContext("Migration 1.0.3 of a materiae")
                        .withoutNotCreatedError()
                        .withData("quantite",
                            MigrationTools.toInteger(actorValue.quantite))
                        .withoutData('description', 'element')
                        .create();
                }

                // Aspect
                for (let actorValue of actor.system.imago.aspects) {
                    await new EmbeddedItem(actor, actorValue.refid)
                        .withContext("Migration 1.0.3 of an aspect")
                        .withoutNotCreatedError()
                        .withData("active",
                            MigrationTools.toBoolean(actorValue.active))
                        .withoutData('description', 'degre', 'activation', 'duree')
                        .create();
                }

                // Appel
                for (let actorValue of actor.system.conjuration.appels) {
                    await new EmbeddedItem(actor, actorValue.refid)
                        .withContext("Migration 1.0.3 of an appel")
                        .withoutNotCreatedError()
                        .withData("periode", defaultPeriode?.refid)
                        .withData("status",
                            MigrationTools.toBoolean(actorValue.appris) === true ? Constants.APPRIS : Constants.DECHIFFRE)
                        .withoutData('description', 'degre', 'appel', 'controle', 'visibilite', 'entropie', 'dommages', 'protection')
                        .create();
                }

                // Rite
                for (let actorValue of actor.system.necromancie.rites) {
                    await new EmbeddedItem(actor, actorValue.refid)
                        .withContext("Migration 1.0.3 of a rite")
                        .withoutNotCreatedError()
                        .withData("periode", defaultPeriode?.refid)
                        .withData("status",
                            MigrationTools.toBoolean(actorValue.appris) === true ? Constants.APPRIS : Constants.DECHIFFRE)
                        .withoutData('description', 'cercle', 'desmos')
                        .create();
                }

                // Metamorphe
                if (actor.system.metamorphe?.refid != null) {
                    await new EmbeddedItem(actor, actor.system.metamorphe.refid)
                        .withContext("Migration 1.0.3 of a metamorphe")
                        .withoutNotCreatedError()
                        .withData("formed",
                            MigrationTools.toBoolean(actor.system.metamorphe.metamorphoses))
                        .withData("visible",
                            MigrationTools.toBoolean(actor.system.metamorphe.manifested))
                        .withoutData('description', 'element', 'metamorphoses')
                        .create();
                }

                // Periode
                let previous = null;
                for (let actorPeriode of actor.system.periodes) {

                    // Periode
                    await new EmbeddedItem(actor, actorPeriode.refid)
                        .withContext("Migration 1.0.3 of a periode")
                        .withoutNotCreatedError()
                        .withoutAlreadyEmbeddedError()
                        .withData("actif", true)
                        .withData("previous", previous)
                        .withoutData('description', 'aube', 'contexte')
                        .create();

                    // Arcane
                    for (let actorArcane of (actorPeriode.arcanes ?? [])) {
                        await new EmbeddedItem(actor, actorArcane.refid)
                            .withContext("Migration 1.0.3 of a arcane")
                            .withoutNotCreatedError()
                            .withoutAlreadyEmbeddedError()
                            .withData("periode",
                                actorPeriode.refid)
                            .withData("degre",
                                MigrationTools.toInteger(actorArcane.degre))
                            .withoutData('description')
                            .create();
                    }

                    // Chute
                    for (let actorChute of (actorPeriode.chutes ?? [])) {
                        await new EmbeddedItem(actor, actorChute.refid)
                            .withContext("Migration 1.0.3 of a chute")
                            .withoutNotCreatedError()
                            .withoutAlreadyEmbeddedError()
                            .withData("periode",
                                actorPeriode.refid)
                            .withData("degre",
                                MigrationTools.toInteger(actorChute.degre))
                            .withoutData('description')
                            .create();
                    }

                    // Passe
                    for (let actorPasse of (actorPeriode.passes ?? [])) {
                        await new EmbeddedItem(actor, actorPasse.refid)
                            .withContext("Migration 1.0.3 of a passe")
                            .withoutNotCreatedError()
                            .withoutAlreadyEmbeddedError()
                            .withData("periode",
                                actorPeriode.refid)
                            .withData("degre",
                                MigrationTools.toInteger(actorPasse.degre))
                            .withoutData('description')
                            .create();
                    }

                    // Quete
                    for (let actorQuete of (actorPeriode.quetes ?? [])) {
                        await new EmbeddedItem(actor, actorQuete.refid)
                            .withContext("Migration 1.0.3 of a quete")
                            .withoutNotCreatedError()
                            .withoutAlreadyEmbeddedError()
                            .withData("periode",
                                actorPeriode.refid)
                            .withData("degre",
                                MigrationTools.toInteger(actorQuete.degre))
                            .withoutData('description')
                            .create();
                    }

                    // Savoir
                    for (let actorSavoir of (actorPeriode.savoirs ?? [])) {
                        await new EmbeddedItem(actor, actorSavoir.refid)
                            .withContext("Migration 1.0.3 of a savoir")
                            .withoutNotCreatedError()
                            .withoutAlreadyEmbeddedError()
                            .withData("periode",
                                actorPeriode.refid)
                            .withData("degre",
                                MigrationTools.toInteger(actorSavoir.degre))
                            .withoutData('description')
                            .create();
                    }

                    // Science
                    for (let actorScience of (actorPeriode.sciences ?? [])) {
                        await new EmbeddedItem(actor, actorScience.refid)
                            .withContext("Migration 1.0.3 of a science occulte")
                            .withoutNotCreatedError()
                            .withoutAlreadyEmbeddedError()
                            .withData("periode",
                                actorPeriode.refid)
                            .withData("degre",
                                MigrationTools.toInteger(actorScience.degre))
                            .withoutData('key', 'description')
                            .create();
                    }

                    // Update the previous periode
                    previous = actorPeriode.refid;

                }

                // Update vecus
                for (let item of actor.items.filter(i => i.type === 'vecu')) {
                    const system = foundry.utils.duplicate(item.system);
                    system.competences = system.competences.map(c => c?.refid);
                    await item.update({ ['system']: system });
                    await item.update({ ['system.actif']: new foundry.data.operators.ForcedDeletion() });
                    await item.update({ ['system.description']: new foundry.data.operators.ForcedDeletion() });
                    await item.update({ ['system.element']: new foundry.data.operators.ForcedDeletion() });
                }

                // Update the page properties
                await actor.unsetFlag("world", "currentPeriode");
                await actor.update({ ['system.magie']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.kabbale']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.alchimie.catalyseurs']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.alchimie.formules']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.alchimie.materiae']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.alchimie.voie']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.necromancie']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.conjuration']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.imago']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.metamorphe']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.metamorphoses']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.periodes']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.page']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.options.description']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.periode']: defaultPeriode?.refid });

                // Update damage properties
                await actor.update({ ['system.dommage.physique.cases']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.dommage.physique.choc']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.dommage.magique.cases']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.dommage.magique.choc']: new foundry.data.operators.ForcedDeletion() });

                // Update simulacre property
                const simulacre = actor.system.simulacre.refid;
                await actor.update({ ['system.simulacre.refid']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.simulacre']: simulacre });

                // Update manoeuvers properties
                await actor.update({ ['system.manoeuvres.esquive']: null });
                await actor.update({ ['system.manoeuvres.lutte']: null });

                // Update stase properties
                await actor.update({ ['system.stase.air']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.stase.eau']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.stase.feu']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.stase.lune']: new foundry.data.operators.ForcedDeletion() });
                await actor.update({ ['system.stase.terre']: new foundry.data.operators.ForcedDeletion() });

                // Update akasha
                if (actor.system?.akasha?.nef?.active == null) {
                    await actor.update({ ['system.akasha.nef.active']: false });
                }
                if (actor.system?.akasha?.boussole?.septentrion == null) {
                    await actor.update({ ['system.akasha.boussole.septentrion']: 0 });
                }
                if (actor.system?.akasha?.boussole?.orient == null) {
                    await actor.update({ ['system.akasha.boussole.orient']: 0 });
                }
                if (actor.system?.akasha?.boussole?.midi == null) {
                    await actor.update({ ['system.akasha.boussole.midi']: 0 });
                }
                if (actor.system?.akasha?.boussole?.occident == null) {
                    await actor.update({ ['system.akasha.boussole.occident']: 0 });
                }
                if (actor.system?.akasha?.boussole?.zenith == null) {
                    await actor.update({ ['system.akasha.boussole.zenith']: 0 });
                }
                if (actor.system?.akasha?.boussole?.nadir == null) {
                    await actor.update({ ['system.akasha.boussole.nadir']: 0 });
                }
                if (actor.system?.akasha?.barge?.active == null) {
                    await actor.update({ ['system.akasha.barge.active']: false });
                }
                if (actor.system?.akasha?.compas?.septentrion == null) {
                    await actor.update({ ['system.akasha.compas.septentrion']: 0 });
                }
                if (actor.system?.akasha?.compas?.orient == null) {
                    await actor.update({ ['system.akasha.compas.orient']: 0 });
                }
                if (actor.system?.akasha?.compas?.midi == null) {
                    await actor.update({ ['system.akasha.compas.midi']: 0 });
                }
                if (actor.system?.akasha?.compas?.occident == null) {
                    await actor.update({ ['system.akasha.compas.occident']: 0 });
                }
                if (actor.system?.akasha?.compas?.zenith == null) {
                    await actor.update({ ['system.akasha.compas.zenith']: 0 });
                }
                if (actor.system?.akasha?.compas?.nadir == null) {
                    await actor.update({ ['system.akasha.compas.nadir']: 0 });
                }
                break;

            }

            default:
                break;

        }

        // Remove embedded arme and armure
        for (let o of actor.items.filter(i => i.type === 'arme' || i.type === 'armure')) {
            await actor.deleteEmbeddedDocuments('Item', [o.id]);
        }

    }

}