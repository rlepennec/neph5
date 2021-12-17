import { preloadTemplates } from "./module/common/templates.js";
import { migrateWorld } from "./module/common/migration.js";
import { CustomHandlebarsHelpers } from "./module/common/handlebars.js";

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
        getActor: CustomHandlebarsHelpers.getActor,
        getItem: CustomHandlebarsHelpers.getItem,
        getItems: CustomHandlebarsHelpers.getItems,
        canEditItem: CustomHandlebarsHelpers.canEditItem,
        getLevels: CustomHandlebarsHelpers.getLevels,
        getCompetences: CustomHandlebarsHelpers.getCompetences,
        getVecus: CustomHandlebarsHelpers.getVecus,
        getScience: CustomHandlebarsHelpers.getScience,
        getLevel: CustomHandlebarsHelpers.getLevel,
        isRanged: CustomHandlebarsHelpers.isRanged,
        isMelee: CustomHandlebarsHelpers.isMelee,
        getCount: CustomHandlebarsHelpers.getCount,
        getScore: CustomHandlebarsHelpers.getScore,
        loop: CustomHandlebarsHelpers.loop,
        log: CustomHandlebarsHelpers.log
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

    /*
    Hooks.once('ready', async () => {
        await migrateWorld();
    });
    */

    // Handle message deletion
    // Unregister the message event for all token of the current scene
    /**
     * Event is the chat message
     */
    Hooks.on('deleteChatMessage', async (event) => {
        if (game.user.isGM) {
            for (let token of canvas.tokens.placeables) {
                if (isManaged(token) && token.combatant !== undefined && token.combatant !== null) {
                    await token.combatant.unregisterEvent(event.id);
                }
            }
        }
    });

    // Handle chat message for combat system
    Hooks.on("renderChatMessage", async (app, html, data) => {

        // Hook combat message which allows a reaction such as a defense
        // Hoolk opposite action
        // All needs flags
        const flags = data?.message?.flags[game.system.id];
        if (flags === undefined) {
            return;
        }

        // Handle opposite actions.
        if (game.user.isGM) {
            if (flags.hasOwnProperty('oppositeActionResolved')) {
                if (flags.oppositeActionResolved === false) {

                    // Process the opposition
                    await Rolls.resolveOppositeRoll(flags);

                    // Flags the action as resolved
                    const message = game.messages.get(data.message._id);
                    const newFlags = duplicate(message.data.flags);
                    newFlags.neph5e.oppositeActionResolved = true;
                    return await message.update({ ['flags']: newFlags });
                } else {
                    return;
                } 
            }
        }

        // Check tokens on the canvas
        if (!canvas?.tokens?.objects?.children) {
            return;
        }

        // Gets the target token
        const token = canvas.tokens.objects.children.find((token) => token.data._id === flags.action.target.id);

        // Dispatches the message if:
        // - The token is managed by the current user
        // - The message has not been proccessed by the combatant yet
        if (isManaged(token) && !token.combatant.hasBeenProcessed(data.message._id)) {
            await token.actor.react(token, data.message._id, flags.action);
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
        /*
        game.settings.register('neph5e', 'worldTemplateVersion', {
            name: 'World Template Version',
            hint: 'Used to automatically upgrade worlds data when the template is upgraded.',
            scope: 'world',
            config: false,
            default: 0,
            type: Number,
          });
          */
    }

});
