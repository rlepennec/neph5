import { preloadTemplates } from "./module/common/templates.js";
import { Constants } from "./module/common/constants.js";
import { NephilimChat } from "./module/common/chat.js";
import { Macros } from "./module/common/macros.js";
import { MigrationTools } from "./module/migration/migration.js";
import { CustomHandlebarsHelpers } from "./module/common/handlebars.js";

import { NephilimItem } from "./module/item/entity.js";

import { NephilimActor } from "./module/actor/entity.js";
import { FigureSheet } from "./module/actor/figure.js";
import { FigurantSheet } from "./module/actor/figurant.js";

import { AlchimieSheet } from "./feature/alchimie/item/alchimie.js";
import { AppelSheet } from "./feature/conjuration/item/appel.js";
import { ArcaneSheet } from "./feature/periode/item/arcane.js";
import { ArmeSheet } from "./feature/combat/item/arme.js";
import { ArmureSheet } from "./feature/combat/item/armure.js";
import { AspectSheet } from "./feature/selenim/item/aspect.js";
import { CapaciteSheet } from "./module/item/capacite.js";
import { CatalyseurSheet } from "./feature/alchimie/item/catalyseur.js";
import { ChuteSheet } from "./feature/periode/item/chute.js";
import { CompetenceSheet } from "./feature/periode/item/competence.js";
import { FormuleSheet } from "./feature/alchimie/item/formule.js";
import { InvocationSheet } from "./feature/kabbale/item/invocation.js";
import { MagieSheet } from "./feature/magie/item/magie.js";
import { MateriaeSheet } from "./feature/alchimie/item/materiae.js";
import { MetamorpheSheet } from "./feature/nephilim/item/metamorphe.js";
import { OrdonnanceSheet } from "./feature/kabbale/item/ordonnance.js";
import { PasseSheet } from "./feature/periode/item/passe.js";
import { PeriodeSheet } from "./feature/periode/item/periode.js";
import { PratiqueSheet } from "./feature/denier/item/pratique.js";
import { QueteSheet } from "./feature/periode/item/quete.js";
import { RiteSheet } from "./feature/necromancie/item/rite.js";
import { RituelSheet } from "./feature/epee/item/rituel.js";
import { SavoirSheet } from "./feature/periode/item/savoir.js";
import { ScienceSheet } from "./feature/science/item/science.js";
import { SortSheet } from "./feature/magie/item/sort.js";
import { TechniqueSheet } from "./feature/baton/item/technique.js";
import { TekhneSheet } from "./feature/coupe/item/tekhne.js";
import { VecuSheet } from "./feature/periode/item/vecu.js";

import { NephilimCombatant } from "./feature/combat/core/combatant.js";
import { AbstractRoll } from "./feature/core/abstractRoll.js";
import { OpposedRollBuilder } from "./feature/core/opposedRollBuilder.js";

Hooks.once("init", function () {
    console.log("Nephilim | Initializing Nephilim System");

    CONFIG.Item.documentClass = NephilimItem;
    CONFIG.Actor.documentClass = NephilimActor;
    CONFIG.Combatant.documentClass = NephilimCombatant;

    Handlebars.registerHelper({
        concat: CustomHandlebarsHelpers.concat,
        isNull: CustomHandlebarsHelpers.isNull,
        nonNull: CustomHandlebarsHelpers.nonNull,
        getItem: CustomHandlebarsHelpers.getItem,
        loop: CustomHandlebarsHelpers.loop,
        log: CustomHandlebarsHelpers.log,
        html: CustomHandlebarsHelpers.html,
        includes: CustomHandlebarsHelpers.includes,
        sum: CustomHandlebarsHelpers.sum,
        getSapiences: CustomHandlebarsHelpers.getSapiences,
        getLevel: CustomHandlebarsHelpers.getLevel,
        getSapiences: CustomHandlebarsHelpers.getSapiences,
        getNextCost: CustomHandlebarsHelpers.getNextCost,
        isEmptyCollection: CustomHandlebarsHelpers.isEmptyCollection,
        isEmptyString: CustomHandlebarsHelpers.isEmptyString,
        isContact: CustomHandlebarsHelpers.isContact,
        displayScience: CustomHandlebarsHelpers.displayScience,
        displaySciences: CustomHandlebarsHelpers.displaySciences,
        focus: CustomHandlebarsHelpers.focus,
        science: CustomHandlebarsHelpers.science
    });

    Handlebars.registerHelper('switch', function (value, options) {
        this.switch_value = value;
        this.switch_break = false;
        return options.fn(this);
    });

    Handlebars.registerHelper('case', function (value, options) {
        if (value == this.switch_value) {
            this.switch_break = true;
            return options.fn(this);
        }
    });

    Handlebars.registerHelper('default', function (value, options) {
        if (this.switch_break == false) {
            return value;
        }
    });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("nephilim", FigureSheet, { types: ["figure"], makeDefault: true, label: "NEPHILIM.figure" });
    Actors.registerSheet("nephilim", FigurantSheet, { types: ["figurant"], makeDefault: true, label: "NEPHILIM.figurant" });

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet('nephilim', AlchimieSheet, { types: ['alchimie'], makeDefault: true });
    Items.registerSheet('nephilim', AppelSheet, { types: ['appel'], makeDefault: true });
    Items.registerSheet('nephilim', ArcaneSheet, { types: ['arcane'], makeDefault: true });
    Items.registerSheet('nephilim', ArmeSheet, { types: ['arme'], makeDefault: true });
    Items.registerSheet('nephilim', ArmureSheet, { types: ['armure'], makeDefault: true });
    Items.registerSheet('nephilim', AspectSheet, { types: ['aspect'], makeDefault: true });
    Items.registerSheet('nephilim', CapaciteSheet, { types: ['capacite'], makeDefault: true });
    Items.registerSheet('nephilim', CatalyseurSheet, { types: ['catalyseur'], makeDefault: true });
    Items.registerSheet('nephilim', ChuteSheet, { types: ['chute'], makeDefault: true });
    Items.registerSheet('nephilim', CompetenceSheet, { types: ['competence'], makeDefault: true });
    Items.registerSheet('nephilim', FormuleSheet, { types: ['formule'], makeDefault: true });
    Items.registerSheet('nephilim', InvocationSheet, { types: ['invocation'], makeDefault: true });
    Items.registerSheet('nephilim', PasseSheet, { types: ['passe'], makeDefault: true });
    Items.registerSheet('nephilim', PeriodeSheet, { types: ['periode'], makeDefault: true });
    Items.registerSheet('nephilim', PratiqueSheet, { types: ['pratique'], makeDefault: true });
    Items.registerSheet('nephilim', QueteSheet, { types: ['quete'], makeDefault: true });
    Items.registerSheet('nephilim', MagieSheet, { types: ['magie'], makeDefault: true });
    Items.registerSheet('nephilim', MateriaeSheet, { types: ['materiae'], makeDefault: true });
    Items.registerSheet('nephilim', MetamorpheSheet, { types: ['metamorphe'], makeDefault: true });
    Items.registerSheet('nephilim', OrdonnanceSheet, { types: ['ordonnance'], makeDefault: true });
    Items.registerSheet('nephilim', RiteSheet, { types: ['rite'], makeDefault: true });
    Items.registerSheet('nephilim', RituelSheet, { types: ['rituel'], makeDefault: true });
    Items.registerSheet('nephilim', SavoirSheet, { types: ['savoir'], makeDefault: true });
    Items.registerSheet('nephilim', ScienceSheet, { types: ['science'], makeDefault: true });
    Items.registerSheet('nephilim', SortSheet, { types: ['sort'], makeDefault: true });
    Items.registerSheet('nephilim', TechniqueSheet, { types: ['technique'], makeDefault: true });
    Items.registerSheet('nephilim', TekhneSheet, { types: ['tekhne'], makeDefault: true });
    Items.registerSheet('nephilim', VecuSheet, { types: ['vecu'], makeDefault: true });

    preloadTemplates();
    registerSystemSettings();

    // Migrate data model if necessary
    Hooks.once('ready', async () => {
        await MigrationTools.migrate();
    });

    // Add data to combatant
    Hooks.on("createCombatant", async (combat, data) => {
        if (!game.user.isGM) return;
        const status = {
            effects: [],
            history: {
                round: null,
                attacks: [],
                defenses: [],
                exclusive: null
            }
        }
        await combat.setFlag("world", "combat", status);
    })

    // Disable simulacre creation
    Hooks.on("createActor", async (actor, data, options, user) => {
        if (actor.type === 'simulacre') {
            ui.notifications.error("Les Simulacres ne doivent plus être utilisés. Veuillez utiliser les acteurs Figurant.");
            await actor.delete();
            return false;
        }
    })

    // The hook to pre-create actor
    Hooks.on("preCreateActor", async (actor, data, options, user) => {

        // If duplicate, create a new uuid
        if (actor.link.startsWith("@UUID[Actor") && actor.link.endsWith(" (Copy)}")) {
            const uuid = CustomHandlebarsHelpers.UUID();
            actor.system.id = uuid;
            data.system.id = uuid;
            actor._source.system.id = uuid;
            return true; 
        }

    });

    // The hook to pre-create item
    Hooks.on("preCreateItem", async (item, data, options, user) => {

        // If duplicate, create a new uuid
        if (item.link.startsWith("@UUID[Item") && item.link.endsWith(" (Copy)}")) {
            const uuid = CustomHandlebarsHelpers.UUID();
            item.sid = uuid;
            data.system.id = uuid;
            item.data._source.data.id = uuid;
            return true;
        }

    });

    // Handle chat message for opposed rolls, especially combat system
    Hooks.on("renderChatMessage", async (app, html, data) => {
        const reaction = await OpposedRollBuilder.create(data);
        if (reaction != null) {
            await reaction.initialize();
            await NephilimChat.unsetFlags(data.message._id);
        }
    });

    // Handle the macro creation
    Hooks.on("hotbarDrop", async (bar, data, slot) => await Macros.create(bar, data, slot));

    // Register socket messages
    game.socket.on(Constants.SYSTEM_SOCKET_ID, async socketMessage => {
        await NephilimChat.onSocketMessage(socketMessage);
    });

    /**
     * Register the system settings
     */
    function registerSystemSettings() {
        game.settings.register('neph5e', 'debug', {
            config: true,
            scope: 'world',
            name: game.i18n.localize('SETTINGS.debug'),
            hint: game.i18n.localize('SETTINGS.debugDesc'),
            type: Boolean,
            default: false
        });
        game.settings.register('neph5e', 'catalyseurs', {
            config: true,
            scope: 'world',
            name: game.i18n.localize('SETTINGS.catalyseurs'),
            hint: game.i18n.localize('SETTINGS.catalyseursDesc'),
            type: Boolean,
            default: false
        });
        game.settings.register('neph5e', 'sciencesOccultes', {
            config: true,
            scope: 'world',
            name: game.i18n.localize('SETTINGS.sciencesOccultes'),
            hint: game.i18n.localize('SETTINGS.sciencesOccultesDesc'),
            type: Boolean,
            default: false
        });
        game.settings.register('neph5e', 'useCombatSystem', {
            config: true,
            scope: 'world',
            name: game.i18n.localize('SETTINGS.useCombatSystem'),
            hint: game.i18n.localize('SETTINGS.useCombatSystemDesc'),
            type: Boolean,
            default: false
        });
        game.settings.register('neph5e', 'worldTemplateVersion', {
            name: 'World Template Version',
            hint: 'Used to automatically upgrade worlds data when the template is upgraded.',
            scope: 'world',
            config: false,
            default: "1.0.0",
            type: String,
        });
    }

});
