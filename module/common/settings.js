import { NettoyageDialog } from "./nettoyage.js";
import { Fiches } from "./fiches.js";
import { positionOf } from "../item/positions.js";
import { Repertoire } from "../item/repertoire.js";
import { Version } from "./version.js";

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
                    // Les fiches deja ouvertes changent aussi de taille : sans
                    // cela, le nouveau style s'afficherait dans les dimensions
                    // de l'ancien jusqu'a la prochaine ouverture.
                    app.setPosition(positionOf(app.document.type, value));
                    app.render(false);
                }
            }
        }
    });

    // La version des règles du monde. Le MJ en mode création peut travailler dans une autre, sa
    // version de préparation (voir Preparation et Version.world).
    game.settings.register('neph5e', 'version', {
        // Les objets affichés suivent la version : le répertoire des items et les compendiums
        // d'items sont réaffichés (voir Repertoire)
        onChange: () => {
            Version.oublierMonde();
            Repertoire.rafraichir();
            // Les fiches suivent la version du monde (voir Fiches)
            Fiches.rafraichir();
        },
        config: true,
        scope: 'world',
        name: game.i18n.localize('SETTINGS.version'),
        hint: game.i18n.localize('SETTINGS.versionDesc'),
        type: String,
        choices: Object.fromEntries(Version.ALL.map(v => [v, game.i18n.localize('NEPHILIM.' + v)])),
        default: 'v5'
    });

    // Le mode du MJ (voir Version.visible) : en création ('types'), il voit tous les objets des
    // types compatibles avec la version de règles du monde et prépare les autres versions ; en
    // jeu ('objets'), il voit comme les joueurs, les seuls objets activés pour la version.
    game.settings.register('neph5e', 'filtreObjets', {
        // Le mode décide aussi de la version de travail du MJ (voir Version.world)
        onChange: () => {
            Version.oublierMonde();
            Repertoire.rafraichir();
            Fiches.rafraichir();
            ui.controls?.render();
        },
        config: true,
        scope: 'world',
        name: game.i18n.localize('SETTINGS.filtreObjets'),
        hint: game.i18n.localize('SETTINGS.filtreObjetsDesc'),
        type: String,
        choices: {
            types: game.i18n.localize('SETTINGS.filtreObjetsTypes'),
            objets: game.i18n.localize('SETTINGS.filtreObjetsObjets')
        },
        default: 'types'
    });

    // La version de préparation du MJ, propre à son client (voir Preparation) : vide pour la
    // version du monde
    game.settings.register('neph5e', 'versionPreparation', {
        onChange: () => {
            Version.oublierMonde();
            Repertoire.rafraichir();
            Fiches.rafraichir();
            ui.controls?.render();
        },
        config: false,
        scope: 'client',
        type: String,
        default: ''
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

    // Interface Nephilim : le style du système pour l'interface de Foundry (voir
    // less/src/interface.less). Propre à chaque utilisateur, appliqué sans recharger.
    game.settings.register('neph5e', 'interfaceNephilim', {
        config: true,
        scope: 'client',
        name: game.i18n.localize('SETTINGS.interfaceNephilim'),
        hint: game.i18n.localize('SETTINGS.interfaceNephilimDesc'),
        type: Boolean,
        default: true,
        onChange: value => document.body.classList.toggle('neph5e-interface', value === true)
    });
    document.body.classList.toggle('neph5e-interface', game.settings.get('neph5e', 'interfaceNephilim') === true);

    game.settings.register('neph5e', 'combatDetaille', {
        config: true,
        scope: 'world',
        name: game.i18n.localize('SETTINGS.combatDetaille'),
        hint: game.i18n.localize('SETTINGS.combatDetailleDesc'),
        type: Boolean,
        default: false
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