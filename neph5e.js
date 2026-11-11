import { preloadTemplates } from "./module/common/templates.js";
import { registerSystemSettings } from "./module/common/settings.js";
import { Constants } from "./module/common/constants.js";
import { CustomHandlebarsHelpers } from "./module/common/handlebars.js";
import { Macros } from "./module/common/macros.js";
import { MigrationTools } from "./module/migration/migration.js";

import { NephilimItem } from "./module/item/nephilimItem.js";
import { NephilimItemDirectory } from "./module/item/nephilimItemDirectory.js";
import { NephilimCompendium } from "./module/item/nephilimCompendium.js";
import { Repertoire } from "./module/item/repertoire.js";
import { Regles } from "./module/regles/regles.js";
import { JeuV5 } from "./module/regles/v5/jeu.js";
import { JeuEidolon } from "./module/regles/eidolon/jeu.js";
import { Version } from "./module/common/version.js";
import { NephilimActor } from "./module/actor/nephilimActor.js";
import { Fiches } from "./module/common/fiches.js";
import { FicheActeurVide } from "./module/actor/ficheActeurVide.js";
import { FicheObjetVide } from "./module/item/ficheObjetVide.js";
import { NephilimActiveEffect } from "./module/common/nephilimActiveEffect.js";
import { NephilimTokenHUD } from "./module/common/nephilimTokenHUD.js";

import { EphemerideDialog } from "./feature/ephemeride/ephemeride.js";
import { NephilimCombatant } from "./module/common/nephilimCombatant.js";
import { PeriodeSheet } from "./feature/periode/item/periode.js";

import { AlchimieDataModel } from "./feature/alchimie/item/alchimie.mjs";
import { AppelDataModel } from "./feature/conjuration/item/appel.mjs";
import { ArcaneDataModel } from "./feature/arcane/item/arcane.mjs";
import { ArmeDataModel } from "./feature/combat/item/arme.mjs";
import { ArmureDataModel } from "./feature/combat/item/armure.mjs";
import { AspectDataModel } from "./feature/selenim/item/aspect.mjs";
import { AtlanteideDataModel } from "./feature/atlanteide/item/atlanteide.mjs";
import { CatalyseurDataModel } from "./feature/alchimie/item/catalyseur.mjs";
import { CapaciteDataModel } from "./feature/capacite/item/capacite.mjs";
import { ChuteDataModel } from "./feature/chute/item/chute.mjs";
import { CompetenceDataModel } from "./feature/competence/item/competence.mjs";
import { GroupeDataModel } from "./feature/groupe/item/groupe.mjs";
import { GroupeSheet } from "./feature/groupe/item/groupe.js";
import { DivinationDataModel } from "./feature/bohemien/item/divination.mjs";
import { DracomachieDataModel } from "./feature/dracomachie/item/dracomachie.mjs";
import { FormuleDataModel } from "./feature/alchimie/item/formule.mjs";
import { HabitusDataModel } from "./feature/analogie/item/habitus.mjs";
import { InvocationDataModel } from "./feature/kabbale/item/invocation.mjs";
import { MagieDataModel } from "./feature/magie/item/magie.mjs";
import { MateriaeDataModel } from "./feature/alchimie/item/materiae.mjs";
import { MetamorpheDataModel } from "./feature/nephilim/item/metamorphe.mjs";
import { OrdonnanceDataModel } from "./feature/kabbale/item/ordonnance.mjs";
import { PasseDataModel } from "./feature/passe/item/passe.mjs";
import { PeriodeDataModel } from "./feature/periode/item/periode.mjs";
import { IncarnationDataModel } from "./feature/incarnation/item/incarnation.mjs";
import { LaboratoireDataModel } from "./feature/alchimie/item/laboratoire.mjs";
import { AkashaDataModel } from "./feature/akasha/item/akasha.mjs";
import { KaDataModel } from "./feature/figure/ka.mjs";
import { PratiqueDataModel } from "./feature/denier/item/pratique.mjs";
import { RiteDataModel } from "./feature/necromancie/item/rite.mjs";
import { RituelDataModel } from "./feature/epee/item/rituel.mjs";
import { QueteDataModel } from "./feature/quete/item/quete.mjs";
import { SavoirDataModel } from "./feature/savoir/item/savoir.mjs";
import { ScienceDataModel } from "./feature/science/item/science.mjs";
import { SortDataModel } from "./feature/magie/item/sort.mjs";
import { TechniqueDataModel } from "./feature/baton/item/technique.mjs";
import { TekhneDataModel } from "./feature/coupe/item/tekhne.mjs";
import { VecuDataModel } from "./feature/vecu/item/vecu.mjs";

import { FigureDataModel } from "./feature/figure/figure.mjs";
import { FigurantDataModel } from "./feature/figurant/figurant.mjs";
import { FraterniteDataModel } from "./feature/fraternite/fraternite.mjs";

Hooks.once("init", function () {
    console.log("Nephilim | Initializing Nephilim System");

    // Les jeux de règles disponibles (voir Regles)
    Regles.enregistrer(JeuV5);
    Regles.enregistrer(JeuEidolon);

    CONFIG.Item.documentClass = NephilimItem;
    CONFIG.Actor.documentClass = NephilimActor;
    CONFIG.Combatant.documentClass = NephilimCombatant;
    // Les combattants, les effets et le HUD des jetons demandent aux règles (voir Regles)
    CONFIG.ActiveEffect.documentClass = NephilimActiveEffect;
    CONFIG.Token.hudClass = NephilimTokenHUD;

    // Le répertoire des items de la barre latérale : il n'affiche et ne propose à la création
    // que les types compatibles avec la version de règles du monde, parmi Repertoire.TYPES.
    CONFIG.ui.items = NephilimItemDirectory;

    CONFIG.Canvas.layers.nephilim = { layerClass: foundry.canvas.layers.ControlsLayer, group: "primary" };
    CONFIG.TinyMCE = {
        branding: false,
        menubar: false,
        statusbar: false,
        content_css: ["systems/neph5e/module/common/mce.css"],
        plugins: "lists image table code save link",
        toolbar: "styles bullist numlist image table hr link removeformat code save",
        save_enablewhendirty: true
    };

    const ACTOR_TYPES = {
        figure: { model: FigureDataModel, label: "NEPHILIM.figure" },
        figurant: { model: FigurantDataModel, label: "NEPHILIM.figurant" },
        fraternite: { model: FraterniteDataModel, label: "NEPHILIM.fraternite" }
    }

    CONFIG.Actor.dataModels = Object.fromEntries(
        Object.entries(ACTOR_TYPES).map(([type, { model }]) => [type, model])
    );

    // La fiche d'un document suit la version du monde (voir Fiches) : celle du jeu de règles, ou
    // la fiche commune du type, ou la fiche vide. Foundry ne connaît que la fiche vide, qui lui
    // donne une fiche par défaut pour chaque type ; NephilimActor et NephilimItem choisissent.
    foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
    for (const [type, { label }] of Object.entries(ACTOR_TYPES)) {
        foundry.documents.collections.Actors.registerSheet('nephilim', FicheActeurVide, { types: [type], makeDefault: true, label: label });
        Fiches.declarer('Actor', type, FicheActeurVide);
    }

    const ITEM_TYPES = {
        alchimie: { model: AlchimieDataModel },
        appel: { model: AppelDataModel },
        arcane: { model: ArcaneDataModel },
        arme: { model: ArmeDataModel },
        armure: { model: ArmureDataModel },
        aspect: { model: AspectDataModel },
        atlanteide: { model: AtlanteideDataModel },
        capacite: { model: CapaciteDataModel },
        catalyseur: { model: CatalyseurDataModel },
        chute: { model: ChuteDataModel },
        competence: { model: CompetenceDataModel },
        divination: { model: DivinationDataModel },
        dracomachie: { model: DracomachieDataModel },
        formule: { model: FormuleDataModel },
        groupe: { model: GroupeDataModel, sheet: GroupeSheet },
        habitus: { model: HabitusDataModel },
        invocation: { model: InvocationDataModel },
        magie: { model: MagieDataModel },
        materiae: { model: MateriaeDataModel },
        metamorphe: { model: MetamorpheDataModel },
        ordonnance: { model: OrdonnanceDataModel },
        passe: { model: PasseDataModel },
        periode: { model: PeriodeDataModel, sheet: PeriodeSheet },
        pratique: { model: PratiqueDataModel },
        quete: { model: QueteDataModel },
        rite: { model: RiteDataModel },
        rituel: { model: RituelDataModel },
        savoir: { model: SavoirDataModel },
        science: { model: ScienceDataModel },
        sort: { model: SortDataModel },
        technique: { model: TechniqueDataModel },
        tekhne: { model: TekhneDataModel },
        vecu: { model: VecuDataModel }
    };

    CONFIG.Item.dataModels = Object.fromEntries(
        Object.entries(ITEM_TYPES).map(([type, { model }]) => [type, model])
    );

    // L'incarnation n'existe qu'embarquée, et seule la façade Incarnations la crée : pas de
    // fiche, et elle n'est pas proposée à la création dans la barre latérale.
    CONFIG.Item.dataModels.incarnation = IncarnationDataModel;
    // Les objets de règles d'une incarnation de figure (voir IncarnationsV5.REGLES) : embarqués
    // seulement, créés par la façade, sans fiche ni création dans la barre latérale.
    CONFIG.Item.dataModels.laboratoire = LaboratoireDataModel;
    CONFIG.Item.dataModels.akasha = AkashaDataModel;
    CONFIG.Item.dataModels.ka = KaDataModel;
    Repertoire.TYPES = Object.keys(ITEM_TYPES);

    // Les index des compendiums d'items portent l'activation de chaque version : le filtre
    // des objets activés en a besoin sans charger les documents (voir Version.visible).
    CONFIG.Item.compendiumIndexFields = [
        ...(CONFIG.Item.compendiumIndexFields ?? []),
        ...Version.ALL.map(version => `system.versions.${version}.enabled`)
    ];

    // Les compendiums d'items n'affichent que les types compatibles avec la version de règles
    // du monde, comme le répertoire des items : leur fenêtre est posée avant d'être créée
    // (Game.initializeUI, après le hook setup).
    Hooks.once("setup", () => {
        for (const pack of game.packs) {
            if (pack.documentName === 'Item') pack.applicationClass = NephilimCompendium;
        }
    });

    for (const [type, { sheet }] of Object.entries(ITEM_TYPES)) {
        foundry.documents.collections.Items.registerSheet('nephilim', FicheObjetVide, { types: [type], makeDefault: true });
        Fiches.declarer('Item', type, sheet ?? FicheObjetVide);
    }

    Handlebars.registerHelper({
        range: CustomHandlebarsHelpers.range,
        fsid: CustomHandlebarsHelpers.fsid,
        getIdentifier: CustomHandlebarsHelpers.getIdentifier,
        translate: CustomHandlebarsHelpers.translate,
        concat: CustomHandlebarsHelpers.concat,
        versionValue: CustomHandlebarsHelpers.versionValue,
        versionPrefix: CustomHandlebarsHelpers.versionPrefix,
        isNull: CustomHandlebarsHelpers.isNull,
        nonNull: CustomHandlebarsHelpers.nonNull,
        select: CustomHandlebarsHelpers.select,
        loop: CustomHandlebarsHelpers.loop,
        log: CustomHandlebarsHelpers.log,
        html: CustomHandlebarsHelpers.html,
        includes: CustomHandlebarsHelpers.includes,
        isEmptyCollection: CustomHandlebarsHelpers.isEmptyCollection,
        isEmptyHtml: CustomHandlebarsHelpers.isEmptyHtml,
        getSystemOption: CustomHandlebarsHelpers.getSystemOption,
        selectChoices: CustomHandlebarsHelpers.selectChoices,
        minus: (v1, v2) => v1 - v2,
    });

    // Les aides des gabarits de chaque jeu de règles : toutes à la fois, la version du monde
    // pouvant changer à chaud (voir Regles)
    for (const jeu of Regles.tous()) {
        if (jeu.aides != null) Handlebars.registerHelper(jeu.aides);
    }

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

    preloadTemplates();
    registerSystemSettings();

    // Migrate data model if necessary
    Hooks.once('ready', async () => {
        await MigrationTools.migrate();
    });

    // Add some controls : l'éphéméride, commune, et les outils des règles de la version courante
    // (voir Regles), relus à chaque affichage des contrôles
    Hooks.on("getSceneControlButtons", controls => {
        controls.nephilim = {
            name: "nephilim",
            title: "Nephilim",
            icon: "fa-solid fa-feather-pointed",
            tools: {
                ephemeride: {
                    name: "ephemeride",
                    title: "Ephéméride",
                    icon: "fa-solid fa-eclipse",
                    order: 2,
                    toggle: true,
                    onChange: (e, t) => { new EphemerideDialog().render(true) }
                },
                ...Regles.courantes.outils
            }
        }
    })

    // Défaut de Foundry : le formulaire du token envoie toujours actorId. Quand on y change le lien
    // à l'acteur, Foundry croit que le token a changé d'acteur et le retire de son propre acteur
    // (TokenDocument#_onUpdate). Jusqu'au rechargement, ses icônes ne suivaient plus les états.
    Hooks.on("updateToken", (token, changed) => {
        if ("actorId" in changed || "actorLink" in changed) token.baseActor?._registerDependentToken(token);
    });

    // Les événements suivants ne concernent que les règles : ils sont transmis au jeu de la
    // version courante, s'il y réagit (voir Regles et EvenementsV5).
    const evenements = () => Regles.courantes.evenements ?? {};

    Hooks.on("preCreateCombatant", (combatant, data, options, userId) => {
        return evenements().combattantCree?.(combatant);
    })

    Hooks.on("combatRound", async (combat, updateData, updateOptions) => {
        await evenements().nouveauRound?.(combat);
    })

    // [V14] Les hooks preCreateActor et preCreateItem ont ete supprimes.
    // Ils regeneraient system.id d'un doublon en reconnaissant le suffixe
    // " (Copy)" du nom -- donc uniquement le bouton Dupliquer, et seulement
    // en anglais. La regle vit desormais dans NephilimActor._preCreate et
    // NephilimItem._preCreate, ou elle s'appuie sur data._stats.duplicateSource
    // (marqueur pose par Foundry, independant de la langue), sur l'absence
    // d'identifiant, et sur un controle d'unicite dans le monde.

    Hooks.on("renderChatMessageHTML", async (message, html) => {
        await evenements().messageAffiche?.(message, html);
    });

    // Handle the macro creation
    // Le hook doit retourner false de façon SYNCHRONE pour annuler le traitement par
    // défaut de Foundry (macro "Display ..." à l'icône générique). Un handler async
    // retournerait une Promise, toujours vraie, et le défaut s'appliquerait quand même.
    // Les règles prennent d'abord leurs dépôts (les jets d'une fiche), puis le commun.
    Hooks.on("hotbarDrop", (bar, data, slot) => {
        if (evenements().macroDeposee?.(bar, data, slot) === true) return false;
        if (!Macros.handles(data)) return;
        Macros.create(bar, data, slot);
        return false;
    });

    // Register socket messages
    game.socket.on(Constants.SYSTEM_SOCKET_ID, async socketMessage => {
        await evenements().messageRecu?.(socketMessage);
    });

});