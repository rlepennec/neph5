export const registerSystemSettings = function () {

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
