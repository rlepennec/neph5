import { preloadTemplates } from "./module/common/templates.js";
import { MigrationTools } from "./module/common/migration.js";
import { CustomHandlebarsHelpers } from "./module/common/handlebars.js";
import { UUID } from "./module/common/tools.js";
import { createMacro } from "./module/common/macros.js";

import { NephilimActor } from "./module/actor/entity.js";
import { NephilimItem } from "./module/item/entity.js";

import { FigureSheet } from "./module/actor/sheet/figure.js";
import { FigurantSheet } from "./module/actor/sheet/figurant.js";
import { SimulacreSheet } from "./module/actor/sheet/simulacre.js";

import { AlchimieSheet } from "./module/item/sheet/alchimie.js";
import { AppelSheet } from "./module/item/sheet/appel.js";
import { ArcaneSheet } from "./module/item/sheet/arcane.js";
import { ArmeSheet } from "./module/item/sheet/arme.js";
import { ArmureSheet } from "./module/item/sheet/armure.js";
import { AspectSheet } from "./module/item/sheet/aspect.js";
import { CapaciteSheet } from "./module/item/sheet/capacite.js";
import { CatalyseurSheet } from "./module/item/sheet/catalyseur.js";
import { ChuteSheet } from "./module/item/sheet/chute.js";
import { CompetenceSheet } from "./module/item/sheet/competence.js";
import { FormuleSheet } from "./module/item/sheet/formule.js";
import { InvocationSheet } from "./module/item/sheet/invocation.js";
import { MagieSheet } from "./module/item/sheet/magie.js";
import { MateriaeSheet } from "./module/item/sheet/materiae.js";
import { MetamorpheSheet } from "./module/item/sheet/metamorphe.js";
import { OrdonnanceSheet } from "./module/item/sheet/ordonnance.js";
import { PasseSheet } from "./module/item/sheet/passe.js";
import { PeriodeSheet } from "./module/item/sheet/periode.js";
import { PratiqueSheet } from "./module/item/sheet/pratique.js";
import { QueteSheet } from "./module/item/sheet/quete.js";
import { RiteSheet } from "./module/item/sheet/rite.js";
import { RituelSheet } from "./module/item/sheet/rituel.js";
import { SavoirSheet } from "./module/item/sheet/savoir.js";
import { ScienceSheet } from "./module/item/sheet/science.js";
import { SortSheet } from "./module/item/sheet/sort.js";
import { TechniqueSheet } from "./module/item/sheet/technique.js";
import { TekhneSheet } from "./module/item/sheet/tekhne.js";
import { VecuSheet } from "./module/item/sheet/vecu.js";

import { NephilimCombatant } from "./module/combat/combatant.js";
import { Rolls } from "./module/common/rolls.js";

Hooks.once("init", function () {
    console.log("Nephilim | Initializing Nephilim System");

    CONFIG.Item.documentClass = NephilimItem;
    CONFIG.Actor.documentClass = NephilimActor;
    CONFIG.Combatant.documentClass = NephilimCombatant;

    Handlebars.registerHelper({
        concat: CustomHandlebarsHelpers.concat,
        defined: CustomHandlebarsHelpers.defined,
        getActor: CustomHandlebarsHelpers.getActor,
        getItem: CustomHandlebarsHelpers.getItem,
        getEmbeddedItem: CustomHandlebarsHelpers.getEmbeddedItem,
        getItems: CustomHandlebarsHelpers.getItems,
        canEditItem: CustomHandlebarsHelpers.canEditItem,
        getLevels: CustomHandlebarsHelpers.getLevels,
        getSapiences: CustomHandlebarsHelpers.getSapiences,
        getCompetences: CustomHandlebarsHelpers.getCompetences,
        getVecus: CustomHandlebarsHelpers.getVecus,
        getScience: CustomHandlebarsHelpers.getScience,
        getLevel: CustomHandlebarsHelpers.getLevel,
        getSapiences: CustomHandlebarsHelpers.getSapiences,
        getNextCost: CustomHandlebarsHelpers.getNextCost,
        isEmptyCollection: CustomHandlebarsHelpers.isEmptyCollection,
        isEmptyString: CustomHandlebarsHelpers.isEmptyString,
        isMelee: CustomHandlebarsHelpers.isMelee,
        getCount: CustomHandlebarsHelpers.getCount,
        loop: CustomHandlebarsHelpers.loop,
        log: CustomHandlebarsHelpers.log,
        html: CustomHandlebarsHelpers.html
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
    Actors.registerSheet("nephilim", SimulacreSheet, { types: ["simulacre"], makeDefault: true, label: "NEPHILIM.simulacre" });

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

    Hooks.once('ready', async () => {
        await MigrationTools.migrate();
    });

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

    // The hook to create a macro by draggind and dropping an item of the character sheet in the hot bar.
    Hooks.on("hotbarDrop", async (bar, data, slot) => createMacro(bar, data, slot));

    // The hook to pre-create item.
    Hooks.on("preCreateItem", (item, data, options, user) => {

        // Si duplication
        if (item.link.startsWith("@Item[null]{") && item.link.endsWith(" (Copy)}")) {
            const uuid = UUID();
            item.data.data.id = uuid;
            data.data.id = uuid;
            item.data._source.data.id = uuid;
            return true;
        }

        // Si copie dans un acteur
        if (item.actor !== null) {
            return true;
        }

        // Si copie dans un compendium
        if (item.compendium !== undefined) {
            console.log("Add item from world in compendium");

            const compendiumName = item.compendium.collection;
            const pack = game.packs.get(compendiumName);
            const compendiumItem = pack.find(i => i.data.data.id === item.data.data.id) ;
            const exists = compendiumItem !== undefined;
            if (exists) {
                console.log("Update item from world in compendium");
                /*
                const newData = duplicate(data.data);
                newData.id = worldItem.data.data.id;
                worldItem.update({['data']: newData});
                */
                return true;
    
            } else {
                console.log("Add item from world in compendium");
                return true;
    
            }
        }

        // Copie dans monde depuis compendium. Peut etre autre chose.
        const worldItem = game.items.find(i => i.data.data.id === item.data.data.id) ;
        const alreadyExists = worldItem !== undefined;
        if (alreadyExists) {
            console.log("Update item from compendium in world");
            const newData = duplicate(data.data);
            newData.id = worldItem.data.data.id;
            worldItem.update({['data']: newData});
            return false;

        } else {
            console.log("Add item from compendium in world");
            return true;

        }

    });

    // Handle chat message for combat system
    Hooks.on("renderChatMessage", async (app, html, data) => {

        // Hook messages ussing flags with the system identifier allows
        //   - To resolve opposed actions
        //   - To react against some attacks
        const flags = data?.message?.flags[game.system.id];
        if (flags === undefined) {
            return;
        }

        // Players and GM can perform an opposed action.
        // Only GM can handle opposed actions.
        if (flags.hasOwnProperty(Rolls.OPPOSED)) {
            if (game.user.isGM) {
                await Rolls.resolveOpposedRoll(flags);
                await game.messages.get(data.message._id).unsetFlag(game.system.id, Rolls.OPPOSED);
            }
            return;
        }

        // Players and GM can perform an attack.
        // Only defender can handle attack to defend.
        if (flags.hasOwnProperty('attack')) {

            // Check tokens on the canvas
            if (!canvas?.tokens?.objects?.children) {
                return;
            }

            // Gets the target token and dispatches the message if:
            // - The token is managed by the current user
            // - The message has not been proccessed by the combatant yet
            const token = canvas.tokens.objects.children.find((t) => t.data._id === flags.attack.target.id);
            if (isManaged(token)) {
                await token.actor.react(token, data.message._id, flags.attack);
            }

            return;
        }

        // Players and GM can perform a defense against an attack.
        // Only the GM can handle defense to unset flags from defense and intial attack.
        if (flags.hasOwnProperty('defense')) {
            if (game.user.isGM) {
                const attackEventId = flags.defense.attackEventId;
                await game.messages.get(attackEventId).unsetFlag(game.system.id, 'attack');
                await game.messages.get(data.message._id).unsetFlag(game.system.id, 'defense');
            }
            return;
        }

    });

    /**
     * Indicates if the specified token is managed and can be updated.
     * @param token The token to watch.
     * @return true if managed.
     */
    function isManaged(token) {

        // Initialization
        let initialized = false;

        // Token not defined
        if (token === undefined) {
            return initialized;
        }

        // Gets the actor of the token
        const actor = token.actor;
        if (actor === undefined) {
            return initialized;
        }

        // Managed if:
        //  the user is not a GM and is the owner of the token
        //  the user is the GM and token has no player owner or the player owner is not active
        if (game.user.isGM) {
            if (!actor.hasPlayerOwner) {
                initialized = true;
            } else {
                let activeOwner = 0;
                for (const [userId, perm] of Object.entries(actor.data.permission)) {
                    if (perm === 3) {
                        const user = game.users.get(userId);
                        if (!user.isGM && user.active) {
                            activeOwner = activeOwner + 1;
                        }
                    }
                }
                if (activeOwner === 0) {
                    initialized = true;
                }
            }
        } else {
            if (token.owner) {
                initialized = true;
            }
        }

        // Returns the result
        return initialized

    }

    function registerSystemSettings() {
        game.settings.register('neph5e', 'debug', {
            config: true,
            scope: 'world',
            name: game.i18n.localize('SETTINGS.debug'),
            hint: game.i18n.localize('SETTINGS.debugDesc'),
            type: Boolean,
            default: false
        });
        game.settings.register('neph5e', 'useV3', {
            config: true,
            scope: 'world',
            name: game.i18n.localize('SETTINGS.useV3'),
            hint: game.i18n.localize('SETTINGS.useV3Desc'),
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
        game.settings.register('neph5e', 'uuidMelee', {
            config: true,
            scope: 'world',
            name: game.i18n.localize('SETTINGS.uuidMelee'),
            hint: game.i18n.localize('SETTINGS.uuidMeleeDesc'),
            type: String,
            default: '8b2b8da6-b8cddff0-bfcd50b6-48cec162'
        });
        game.settings.register('neph5e', 'uuidDodge', {
            config: true,
            scope: 'world',
            name: game.i18n.localize('SETTINGS.uuidDodge'),
            hint: game.i18n.localize('SETTINGS.uuidDodgeDesc'),
            type: String,
            default: '456ea358-8ce41469-677e0602-4c5fddcd'
        });
        game.settings.register('neph5e', 'uuidHand', {
            config: true,
            scope: 'world',
            name: game.i18n.localize('SETTINGS.uuidHand'),
            hint: game.i18n.localize('SETTINGS.uuidHandDesc'),
            type: String,
            default: 'd36beb62-017415a5-325fb05e-de7fd714'
        });
        game.settings.register('neph5e', 'uuidDraft', {
            config: true,
            scope: 'world',
            name: game.i18n.localize('SETTINGS.uuidDraft'),
            hint: game.i18n.localize('SETTINGS.uuidDraftDesc'),
            type: String,
            default: 'bd18f1cc-2e108eb2-988cec32-3727ed1b'
        });
        game.settings.register('neph5e', 'uuidFire', {
            config: true,
            scope: 'world',
            name: game.i18n.localize('SETTINGS.uuidFire'),
            hint: game.i18n.localize('SETTINGS.uuidFireDesc'),
            type: String,
            default: 'f82328b3-7ac00919-d54625c1-c1a5e138'
        });
        game.settings.register('neph5e', 'uuidHeavy', {
            config: true,
            scope: 'world',
            name: game.i18n.localize('SETTINGS.uuidHeavy'),
            hint: game.i18n.localize('SETTINGS.uuidHeavyDesc'),
            type: String,
            default: '146b1eaf-9d2d1038-b6d1534c-d8a7cc98'
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
