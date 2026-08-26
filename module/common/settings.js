import { NettoyageDialog } from "./nettoyage.js";

export const registerSystemSettings = function () {

    // Bouton d'outil, reserve au MJ par restricted: true.
    // registerMenu attend une classe d'application ; NettoyageDialog est une
    // ApplicationV2, le systeme n'utilisant plus aucune application V1.
    game.settings.registerMenu('neph5e', 'nettoyage', {
        name: game.i18n.localize('SETTINGS.nettoyage'),
        hint: game.i18n.localize('SETTINGS.nettoyageDesc'),
        label: game.i18n.localize('SETTINGS.nettoyageLabel'),
        icon: 'fas fa-broom',
        type: NettoyageDialog,
        restricted: true
    });

    game.settings.register('neph5e', 'styleItemSheet', {
        config: true,
        name: game.i18n.localize('SETTINGS.styleItemSheet'),
        hint: game.i18n.localize('SETTINGS.styleItemSheetDesc'),
        scope: "user",
        type: String,
        choices: {
          'classique': game.i18n.localize('NEPHILIM.classique'),
          'ashbury': game.i18n.localize('NEPHILIM.ashbury')
        },
        default: 'classique',
        onChange: value => {
            for (const app of foundry.applications.instances.values()) {
                if (app.document?.documentName === "Item") {
                    app.render(false);
                }
            }
        }
    });

    game.settings.register('neph5e', 'note', {
        config: true,
        scope: 'world',
        name: game.i18n.localize('SETTINGS.note'),
        hint: game.i18n.localize('SETTINGS.noteDesc'),
        type: Boolean,
        default: true
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
        type: String,
        choices: {
            'normal': 'Standard',
            'low': 'Simplifié',
            'none': 'Aucun'
          },
          default: 'none'
    });

    game.settings.register('neph5e', 'worldTemplateVersion', {
        name: 'World Template Version',
        hint: 'Used to automatically upgrade worlds data when the template is upgraded.',
        scope: 'world',
        config: false,
        default: "1.0.0",
        type: String,
    });

    game.settings.register('neph5e', 'fraternitePolicy', {
        config: true,
        name: game.i18n.localize('SETTINGS.fraternitePolicy'),
        hint: game.i18n.localize('SETTINGS.fraternitePolicyDesc'),
        scope: "world",
        type: String,
        choices: {
          'standard': 'Standard',
          'maximum': 'Maximum',
          'bonus': 'Bonus'
        },
        default: 'standard'
    });

    game.settings.register('neph5e', 'modifierPolicy', {
        config: true,
        name: game.i18n.localize('SETTINGS.modifierPolicy'),
        hint: game.i18n.localize('SETTINGS.modifierPolicyDesc'),
        scope: "world",
        type: String,
        choices: {
          'clavier': 'Clavier',
          'liste': 'Liste',
          'slider': "Slider"
        },
        default: 'liste'
    });

    game.settings.register('neph5e', 'modifierRange', {
        config: true,
        name: game.i18n.localize('SETTINGS.modifierRange'),
        hint: game.i18n.localize('SETTINGS.modifierRangeDesc'),
        scope: "world",
        type: String,
        choices: {
          '50': 'De -50% à +50%',
          '100': 'De -100% à +100%'
        },
        default: '50'
    });

    game.settings.register('neph5e', 'extraChatMessages', {
        config: true,
        scope: 'world',
        name: game.i18n.localize('SETTINGS.extraChatMessages'),
        hint: game.i18n.localize('SETTINGS.extraChatMessagesDesc'),
        type: Boolean,
        default: true
    });

    game.settings.register('neph5e', 'debug', {
        config: true,
        scope: 'world',
        name: game.i18n.localize('SETTINGS.debug'),
        hint: game.i18n.localize('SETTINGS.debugDesc'),
        type: Boolean,
        default: false
    });

};