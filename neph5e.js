import { preloadTemplates } from "./module/common/templates.js";
import { registerSystemSettings } from "./module/common/settings.js";
import { Constants } from "./module/common/constants.js";
import { CustomHandlebarsHelpers } from "./module/common/handlebars.js";
import { Macros } from "./module/common/macros.js";
import { MigrationTools } from "./module/migration/migration.js";
import { NephilimChat } from "./module/common/chat.js";

import { NephilimItem } from "./module/item/entity.js";
import { NephilimActor } from "./module/actor/entity.js";
import { FigureSheet } from "./module/actor/figure.js";
import { FigurantSheet } from "./module/actor/figurant.js";
import { FraterniteSheet } from "./module/actor/fraternite.js";

import { AlchimieSheet } from "./feature/alchimie/item/alchimie.js";
import { AppelSheet } from "./feature/conjuration/item/appel.js";
import { ArcaneSheet } from "./feature/periode/item/arcane.js";
import { ArmeSheet } from "./feature/combat/item/arme.js";
import { ArmureSheet } from "./feature/combat/item/armure.js";
import { AtlanteideSheet } from "./feature/atlanteide/item/atlanteide.js";
import { AspectSheet } from "./feature/selenim/item/aspect.js";
import { CapaciteSheet } from "./feature/periode/item/capacite.js";
import { CatalyseurSheet } from "./feature/alchimie/item/catalyseur.js";
import { ChuteSheet } from "./feature/periode/item/chute.js";
import { CompetenceSheet } from "./feature/periode/item/competence.js";
import { DivinationSheet } from "./feature/bohemien/item/divination.js";
import { DracomachieSheet } from "./feature/dracomachie/item/dracomachie.js";
import { EphemerideDialog } from "./feature/ephemeride/ephemeride.js";
import { ExperienceDialog } from "./feature/experience/experience.js";
import { FormuleSheet } from "./feature/alchimie/item/formule.js";
import { HabitusSheet } from "./feature/analogie/item/habitus.js";
import { Health } from "./feature/core/health.js";
import { InvocationSheet } from "./feature/kabbale/item/invocation.js";
import { MagieSheet } from "./feature/magie/item/magie.js";
import { MateriaeSheet } from "./feature/alchimie/item/materiae.js";
import { MetamorpheSheet } from "./feature/nephilim/item/metamorphe.js";
import { NephilimCombatant } from "./feature/combat/core/combatant.js";
import { OpposedRollBuilder } from "./feature/core/opposedRollBuilder.js";
import { OrdonnanceSheet } from "./feature/kabbale/item/ordonnance.js";
import { PasseSheet } from "./feature/periode/item/passe.js";
import { PeriodeSheet } from "./feature/periode/item/periode.js";
import { PratiqueSheet } from "./feature/denier/item/pratique.js";
import { QueteSheet } from "./feature/periode/item/quete.js";
import { RechercheDialog } from "./feature/recherche/recherche.js";
import { RiteSheet } from "./feature/necromancie/item/rite.js";
import { RituelSheet } from "./feature/epee/item/rituel.js";
import { SavoirSheet } from "./feature/periode/item/savoir.js";
import { ScienceSheet } from "./feature/science/item/science.js";
import { SortSheet } from "./feature/magie/item/sort.js";
import { TechniqueSheet } from "./feature/baton/item/technique.js";
import { TekhneSheet } from "./feature/coupe/item/tekhne.js";
import { VecuSheet } from "./feature/periode/item/vecu.js";

Hooks.once("init", function () {
    console.log("Nephilim | Initializing Nephilim System");

    CONFIG.Item.documentClass = NephilimItem;
    CONFIG.Actor.documentClass = NephilimActor;
    CONFIG.Combatant.documentClass = NephilimCombatant;
    CONFIG.Canvas.layers.nephilim = { layerClass: ControlsLayer, group: "primary" };
    CONFIG.TinyMCE = {
        branding: false,
        menubar: false,
        statusbar: false,
        content_css: ["systems/neph5e/module/common/mce.css"],
        plugins: "lists image table code save link",
        toolbar: "styles bullist numlist image table hr link removeformat code save",
        save_enablewhendirty: true
    };

    Handlebars.registerHelper({
        concat: CustomHandlebarsHelpers.concat,
        isNull: CustomHandlebarsHelpers.isNull,
        nonNull: CustomHandlebarsHelpers.nonNull,
        select: CustomHandlebarsHelpers.select,
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
        cercles: CustomHandlebarsHelpers.cercles,
        focus: CustomHandlebarsHelpers.focus,
        numberOfFocus: CustomHandlebarsHelpers.numberOfFocus,
        sciences: CustomHandlebarsHelpers.sciences,
        savoir: CustomHandlebarsHelpers.savoir,
        laboratoryOwner: CustomHandlebarsHelpers.laboratoryOwner,
        constructOf: CustomHandlebarsHelpers.constructOf,
        getMaxBaseMP: CustomHandlebarsHelpers.getMaxBaseMP,
        getMaxFinalMP: CustomHandlebarsHelpers.getMaxFinalMP,
        science: CustomHandlebarsHelpers.science,
        fraterniteBonus: CustomHandlebarsHelpers.fraterniteBonus,
        getSystemOption: CustomHandlebarsHelpers.getSystemOption,
        minus: (v1, v2) => v1 - v2,
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
    Actors.registerSheet("nephilim", FraterniteSheet, { types: ["fraternite"], makeDefault: true, label: "NEPHILIM.fraternite" });

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet('nephilim', AlchimieSheet, { types: ['alchimie'], makeDefault: true });
    Items.registerSheet('nephilim', AppelSheet, { types: ['appel'], makeDefault: true });
    Items.registerSheet('nephilim', ArcaneSheet, { types: ['arcane'], makeDefault: true });
    Items.registerSheet('nephilim', ArmeSheet, { types: ['arme'], makeDefault: true });
    Items.registerSheet('nephilim', ArmureSheet, { types: ['armure'], makeDefault: true });
    Items.registerSheet('nephilim', AspectSheet, { types: ['aspect'], makeDefault: true });
    Items.registerSheet('nephilim', AtlanteideSheet, { types: ['atlanteide'], makeDefault: true });
    Items.registerSheet('nephilim', CapaciteSheet, { types: ['capacite'], makeDefault: true });
    Items.registerSheet('nephilim', CatalyseurSheet, { types: ['catalyseur'], makeDefault: true });
    Items.registerSheet('nephilim', ChuteSheet, { types: ['chute'], makeDefault: true });
    Items.registerSheet('nephilim', CompetenceSheet, { types: ['competence'], makeDefault: true });
    Items.registerSheet('nephilim', DracomachieSheet, { types: ['dracomachie'], makeDefault: true });
    Items.registerSheet('nephilim', DivinationSheet, { types: ['divination'], makeDefault: true });
    Items.registerSheet('nephilim', FormuleSheet, { types: ['formule'], makeDefault: true });
    Items.registerSheet('nephilim', HabitusSheet, { types: ['habitus'], makeDefault: true });
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

    // Add some controls
    Hooks.on("getSceneControlButtons", controls => {
        controls.nephilim = {
            name: "nephilim",
            title: "Nephilim",
            icon: "fa-solid fa-feather-pointed",
            tools: {
                recherche: {
                    name: "recherche",
                    title: "Recherche occulte",
                    icon: "fa fa-book-open",
                    toggle: true,
                    onChange: (e, t) => { new RechercheDialog().render(true) }
                },
                ephemeride: {
                    name: "ephemeride",
                    title: "Ephéméride",
                    icon: "fa-solid fa-eclipse",
                    toggle: true,
                    onChange: (e, t) => { new EphemerideDialog().render(true) }
                },
                experience: {
                    name: "experience",
                    title: "Expérience",
                    icon: "fa-solid fa-coins",
                    toggle: true,
                    onChange: (e, t) => { new ExperienceDialog().render(true) }
                }
            }
        }
    })

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
            item.system.id = uuid;
            data.system.id = uuid;
            item._source.system.id = uuid;
            return true;
        }

    });

    // Handle the actor sheet creation to apply the defined or the default skin
    Hooks.on("renderActorSheet", (app, html, data) => {
        const skin = data.actor.system?.options?.theme;
        $(html[0])
            .removeClass( "skin-soleil skin-air skin-eau skin-feu skin-lune skin-lune-noire skin-terre")
            .addClass( "skin-" + (skin == null ? 'soleil' : skin));
    });

    // Handle chat message for opposed rolls, especially combat system
    Hooks.on("renderChatMessage", async (app, html, data) => {
        const reaction = await OpposedRollBuilder.create(data);
        if (reaction != null) {
            await reaction.initializeRoll();
            await NephilimChat.unsetFlags(data.message._id);
        }
    });

    // Handle the macro creation
    Hooks.on("hotbarDrop", async (bar, data, slot) => await Macros.create(bar, data, slot));

    // Register socket messages
    game.socket.on(Constants.SYSTEM_SOCKET_ID, async socketMessage => {
        switch (socketMessage.msg) {
            case Constants.MSG_UNSET_CHAT_MESSAGE:
                await NephilimChat.onSocketMessage(socketMessage);
                break;
            case Constants.MSG_APPLY_DAMAGES_ON:
                await Health.onSocketMessage(socketMessage);
                break;
            case Constants.MSG_APPLY_EFFECTS_ON:
                await Health.onSocketMessage(socketMessage);
                break;
          }
    });

});