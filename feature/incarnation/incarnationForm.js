import { DragDropMixin } from "../../module/common/dragDropMixin.js";
import { FeatureBuilder } from "../core/featureBuilder.js";
import { Incarnations } from "./incarnations.js";
import { LockableMixin } from "../../module/common/lockableMixin.js";
import { Science } from "../science/science.js";
import { Version } from "../../module/common/version.js";

/**
 * Le formulaire d'une incarnation de figure, ouvert depuis l'onglet incarnations.
 *
 * On y définit l'incarnation par glisser-déposer depuis le monde :
 *   1. une période — elle remplace celle de l'incarnation, ses vécus avec elle ;
 *   2. un vécu — il s'ajoute à ceux de l'incarnation et en vit la période ; son degré se règle
 *      dans le formulaire. Une incarnation peut avoir zéro, un ou plusieurs vécus ;
 *   3. un savoir, une quête, un arcane, une science, une passe d'armes, une chute — acquis
 *      pendant l'incarnation, avec le degré acquis ;
 *   4. un focus (formule, sort, invocation...) ou une capacité — rattachés à l'incarnation.
 * Le formulaire affiche toujours la période en tête, puis liste le reste en onglets dépliants :
 * les vécus, les savoirs, les quêtes et arcanes, les chutes, les ressources, chaque science
 * occulte (ses cercles du plus petit au plus grand, chacun suivi de ses focus), puis les
 * capacités. Un onglet n'apparaît que s'il contient quelque chose ; un dépôt déplie l'onglet de
 * l'objet déposé et replie les autres.
 *
 * Une incarnation NOUVELLE n'existe d'abord qu'ici, à l'état de brouillon : elle est enregistrée
 * dès que sa période est définie, avec le vécu déjà déposé s'il y en a un. Les acquisitions
 * (3, 4) ne se déposent qu'ensuite, sur une incarnation enregistrée.
 *
 * La barre du haut supprime l'incarnation ouverte, après confirmation, et ramène à la fiche.
 *
 * Toutes les écritures passent par la façade Incarnations, ou par la feature de l'item déposé
 * (qui rattache par la façade). Les modifications demandent le formulaire déverrouillé.
 */
export class IncarnationForm extends DragDropMixin(LockableMixin(foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2))) {

    /**
     * Les types déposés comme acquisitions avec un degré, et comme simples rattachements.
     */
    static AVEC_DEGRE = Incarnations.VECUS.filter(t => t !== 'vecu');
    static SANS_DEGRE = [...Incarnations.FOCUS, ...Incarnations.CAPACITES];

    /**
     * Les sciences occultes, dans l'ordre de leurs onglets. Chacune range ses cercles du plus
     * petit au plus grand (Science.cerclesOf), avec sous chacun les focus qui en relèvent.
     */
    static SCIENCES = ['magie', 'kabbale', 'alchimie', 'necromancie', 'conjuration', 'analogie',
        'atlanteide', 'baton', 'coupe', 'denier', 'bohemien', 'dracomachie', 'epee'];

    /**
     * Les onglets dépliants, de haut en bas, avec leur titre. Les sciences occultes s'insèrent
     * à la place de « sciences ». La période n'en est pas un : elle est toujours affichée, en tête.
     */
    static ONGLETS = [
        ['vecus', 'NEPHILIM.vecus'],
        ['savoirs', 'NEPHILIM.savoirs'],
        ['quetes', 'NEPHILIM.quetesArcanes'],
        ['chutes', 'NEPHILIM.chutes'],
        ['ressources', 'NEPHILIM.ressources'],
        ['sciences', null],
        ['autres', 'NEPHILIM.autresAcquis'],
        ['capacites', 'NEPHILIM.capacites']
    ];

    /**
     * @param actor   The figure.
     * @param cle     The key of the incarnation, null for a new one.
     * @param options ApplicationV2 options, and `locked` to open it locked.
     */
    constructor(actor, cle = null, { locked = false, ...options } = {}) {
        super({ id: "incarnation-" + actor.id + "-" + (cle ?? foundry.utils.randomID()), ...options });
        this.actor = actor;
        this.cle = cle;
        this.locked = locked;
        this.brouillon = { periode: null, vecu: null, degre: 0 };
        // Les onglets dépliés, gardés d'un rendu à l'autre
        this.ouverts = new Set(['vecus']);
    }

    static DEFAULT_OPTIONS = {
        classes: ["nephilim", "sheet", "item", "incarnation-form"],
        position: {
            width: 520,
            height: 620
        },
        window: {
            title: "NEPHILIM.incarnation",
            resizable: true
        },
        tag: "form",
        form: {
            handler: IncarnationForm.#onSubmit,
            closeOnSubmit: false,
            submitOnChange: true
        },
        actions: {
            retirer: IncarnationForm.#onRetirer,
            supprimer: IncarnationForm.#onSupprimer,
            ouvrir: IncarnationForm.#onOuvrir,
            ouvrirPeriode: IncarnationForm.#onOuvrirPeriode
        },
        dropHandlers: {
            periode: IncarnationForm.#onDropPeriode,
            vecu: IncarnationForm.#onDropVecu,
            ...Object.fromEntries([...IncarnationForm.AVEC_DEGRE, ...IncarnationForm.SANS_DEGRE]
                .map(t => [t, IncarnationForm.#onDropAcquisition]))
        }
    }

    static PARTS = {
        form: {
            template: "systems/neph5e/feature/incarnation/incarnation-form.hbs"
        }
    }

    /**
     * Le document dont DragDropMixin lit les éléments internes : la figure.
     */
    get document() {
        return this.actor;
    }

    /**
     * @returns true if the user may modify the figure.
     */
    get isEditable() {
        return this.actor.isOwner;
    }

    /**
     * @returns true while the incarnation is a draft, not yet saved.
     */
    get nouvelle() {
        return this.cle == null;
    }

    /**
     * Le formulaire suit les changements de la figure, d'où qu'ils viennent.
     * @override
     */
    async _onFirstRender(context, options) {
        await super._onFirstRender(context, options);
        this.actor.apps[this.id] = this;
    }

    /**
     * @override
     */
    _onClose(options) {
        super._onClose(options);
        delete this.actor.apps[this.id];
    }

    /**
     * @override
     */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const incarnations = new Incarnations(this.actor);

        // Une incarnation retirée entre-temps : le formulaire n'a plus rien à montrer
        if (!this.nouvelle && incarnations.incarnation(this.cle) == null) {
            this.close();
            return context;
        }

        context.style = game.settings.get('neph5e', 'styleItemSheet');
        context.nouvelle = this.nouvelle;

        // La période et le vécu : ceux de l'incarnation, ou ceux du brouillon
        const periode = this.nouvelle ? this.brouillon.periode : incarnations.periodeDe(this.cle);
        const monde = game.items.find(i => i.type === 'periode' && i.sid === periode);
        context.periode = monde == null ? null : {
            sid: monde.sid,
            name: monde.name,
            img: monde.img,
            contexte: Version.data(monde).contexte,
            aube: Version.data(monde).aube
        };

        if (this.nouvelle) {
            const vecu = game.items.find(i => i.type === 'vecu' && i.sid === this.brouillon.vecu);
            context.vecus = vecu == null ? [] : [{ sid: vecu.sid, name: vecu.name, img: vecu.img, degre: this.brouillon.degre }];
        } else {
            context.vecus = incarnations.vecusDe(this.cle).map(vecu =>
                ({ id: vecu.id, sid: vecu.sid, name: vecu.name, img: vecu.img, degre: Version.data(vecu).degre ?? 0 }));
        }


        // Ce qui a été acquis pendant l'incarnation, classé par onglet
        context.onglets = this.#onglets(incarnations, context);

        return context;
    }

    /**
     * Les onglets dépliants du formulaire, de haut en bas. Un onglet n'apparaît que s'il
     * contient quelque chose ; ceux d'une science occulte rangent leurs lignes par cercle.
     * @param incarnations La façade des incarnations de la figure.
     * @param context      Le contexte, qui porte déjà la période et les vécus.
     * @returns les onglets à afficher.
     */
    #onglets(incarnations, context) {

        // Les lignes acquises, réparties par onglet ; celles d'une science, par cercle
        const lignes = new Map();
        const cercles = new Map();
        const acquis = this.nouvelle ? [] :
            incarnations.rattaches(this.cle, [...IncarnationForm.AVEC_DEGRE, ...IncarnationForm.SANS_DEGRE]);
        for (const item of acquis) {
            const avecDegre = IncarnationForm.AVEC_DEGRE.includes(item.type);
            const ligne = {
                id: item.id,
                sid: item.sid,
                name: item.name,
                img: item.img,
                // Un focus rappelle le nom de son cercle (Basse Magie, Malkut...) ; l'onglet dit déjà
                // de quel type est chaque objet.
                precision: Incarnations.FOCUS.includes(item.type) && IncarnationForm.cercleOf(item) != null
                    ? IncarnationForm.nomDuCercle(IncarnationForm.cercleOf(item)) : "",
                avecDegre: avecDegre,
                degre: avecDegre ? incarnations.degreDans(item.sid, this.cle) : null,
                science: item.type === 'science'
            };
            const onglet = IncarnationForm.ongletOf(item);
            const cercle = onglet.startsWith('science.') ? IncarnationForm.cercleOf(item) : null;
            if (cercle != null) {
                if (!cercles.has(onglet)) cercles.set(onglet, new Map());
                const parCercle = cercles.get(onglet);
                if (!parCercle.has(cercle)) parCercle.set(cercle, []);
                parCercle.get(cercle).push(ligne);
            } else {
                if (!lignes.has(onglet)) lignes.set(onglet, []);
                lignes.get(onglet).push(ligne);
            }
        }
        const parNom = (a, b) => a.name.localeCompare(b.name);

        const onglets = [];
        const ajouter = (cle, titre, contenu) => onglets.push({ cle, titre, ouvert: this.ouverts.has(cle), ...contenu });
        for (const [cle, titre] of IncarnationForm.ONGLETS) {
            switch (cle) {
                case 'vecus':
                    if (context.vecus.length > 0) ajouter(cle, game.i18n.localize(titre), { vecus: true });
                    break;
                case 'sciences':
                    for (const science of IncarnationForm.SCIENCES) {
                        const parCercle = cercles.get('science.' + science) ?? new Map();
                        const horsCercle = lignes.get('science.' + science) ?? [];
                        if (parCercle.size === 0 && horsCercle.length === 0) continue;
                        // Du plus petit cercle au plus grand ; sous chacun, le cercle puis ses focus
                        const ordre = Science.cerclesOf(science);
                        const rang = c => { const r = ordre.indexOf(c); return r < 0 ? ordre.length : r; };
                        const rubriques = [...parCercle.entries()]
                            .sort(([a], [b]) => rang(a) - rang(b))
                            .map(([cercle, items]) => ({
                                titre: IncarnationForm.nomDuCercle(cercle),
                                lignes: [...items.filter(i => i.science), ...items.filter(i => !i.science).sort(parNom)]
                            }));
                        // Ce qui relève de la science sans cercle (les ordonnances de la kabbale) : en dernier
                        if (horsCercle.length > 0) {
                            rubriques.push({ titre: IncarnationForm.titreHorsCercle(science), lignes: horsCercle.sort(parNom) });
                        }
                        ajouter('science.' + science, game.i18n.localize('NEPHILIM.' + science), { cercles: rubriques });
                    }
                    break;
                default:
                    if (lignes.has(cle)) ajouter(cle, game.i18n.localize(titre), { lignes: lignes.get(cle).sort(parNom) });
            }
        }
        return onglets;
    }

    /**
     * @param item Un item de la figure, ou du monde.
     * @returns la clé de l'onglet où il se range.
     */
    static ongletOf(item) {
        switch (item?.type) {
            case 'vecu': return 'vecus';
            case 'savoir': return 'savoirs';
            case 'quete':
            case 'arcane': return 'quetes';
            case 'chute': return 'chutes';
            case 'passe': return 'ressources';
            case 'capacite': return 'capacites';
            // Une ordonnance n'a pas de cercle, seulement un monde de kabbale
            case 'ordonnance': return 'science.kabbale';
        }
        const cercle = IncarnationForm.cercleOf(item);
        const science = cercle == null ? null : IncarnationForm.SCIENCES.find(s => Science.cerclesOf(s).includes(cercle));
        return science == null ? 'autres' : 'science.' + science;
    }

    /**
     * @param item Un cercle (science) ou un focus, de la figure ou du monde.
     * @returns la clé du cercle dont il relève, lue sur l'item du monde, null s'il n'en a pas.
     *          Un focus désigne son cercle par une propriété propre à son type (voir
     *          Science.proprieteCercle) : le domaine d'un habitus, la sephirah d'une invocation.
     */
    static cercleOf(item) {
        const original = game.items.find(i => i.sid === item?.sid) ?? item;
        if (original?.type === 'science') return Version.data(original).key ?? null;
        if (!Incarnations.FOCUS.includes(original?.type)) return null;
        return Version.data(original)[Science.proprieteCercle(original.type)] ?? null;
    }

    /**
     * @param cercle La clé d'un cercle.
     * @returns son nom, celui de la science du monde qui le porte.
     */
    static nomDuCercle(cercle) {
        return game.items.find(i => i.type === 'science' && Version.data(i).key === cercle)?.name ?? cercle;
    }

    /**
     * @param science La clé d'une science occulte.
     * @returns le titre de la rubrique de ce qui en relève sans cercle.
     */
    static titreHorsCercle(science) {
        return science === 'kabbale' ? game.i18n.localize('NEPHILIM.ordonnances') : game.i18n.localize('NEPHILIM.autresAcquis');
    }

    /**
     * Un objet vient d'être déposé : son onglet se déplie, les autres se replient.
     * @param item L'item déposé.
     */
    #deplier(item) {
        this.ouverts = new Set([IncarnationForm.ongletOf(item)]);
    }

    /**
     * Retient les onglets que l'utilisateur déplie ou replie, pour les garder au rendu suivant.
     * @override
     */
    async _onRender(context, options) {
        await super._onRender(context, options);
        for (const details of this.element.querySelectorAll('details.onglet')) {
            details.addEventListener('toggle', () => {
                if (details.open) this.ouverts.add(details.dataset.onglet);
                else this.ouverts.delete(details.dataset.onglet);
            });
        }
    }

    /**
     * Les degrés saisis : ceux des vécus (« vecus.<sid> »), et ceux des acquisitions
     * (« degre.<sid> »). Seules les valeurs qui changent sont écrites.
     */
    static async #onSubmit(event, form, formData) {
        if (this.locked) return;
        const valeurs = foundry.utils.expandObject(formData.object);
        const entier = (v) => { const n = parseInt(v); return isNaN(n) ? 0 : n; };

        if (this.nouvelle) {
            const saisi = Object.values(valeurs.vecus ?? {})[0];
            if (saisi !== undefined) this.brouillon.degre = entier(saisi);
            return;
        }

        const incarnations = new Incarnations(this.actor);
        for (const vecu of incarnations.vecusDe(this.cle)) {
            const saisi = valeurs.vecus?.[vecu.sid];
            if (saisi !== undefined && entier(saisi) !== (Version.data(vecu).degre ?? 0)) {
                await incarnations.modifierDegre(vecu, entier(saisi), this.cle);
            }
        }
        for (const [sid, valeur] of Object.entries(valeurs.degre ?? {})) {
            const item = incarnations.exemplaireDans(sid, this.cle);
            if (item != null && entier(valeur) !== incarnations.degreDans(sid, this.cle)) {
                await incarnations.modifierDegre(item, entier(valeur), this.cle);
            }
        }
        this.#rafraichir();
    }

    /**
     * La période déposée : celle du brouillon, ou la nouvelle période de l'incarnation.
     */
    static async #onDropPeriode(event, document) {
        if (document.parent != null) return;
        if (this.nouvelle) {
            this.brouillon.periode = document.sid;
            await this.#enregistrer();
        } else {
            await new Incarnations(this.actor).changerPeriode(this.cle, document.sid);
        }
        this.#rafraichir();
    }

    /**
     * Le vécu déposé : celui du brouillon, ou un vécu de plus pour l'incarnation.
     */
    static async #onDropVecu(event, document) {
        if (document.parent != null) return;
        const incarnations = new Incarnations(this.actor);
        if (incarnations.exemplaires(document.sid).length > 0) {
            ui.notifications.warn(Incarnations.DEJA_VECU);
            return;
        }
        if (this.nouvelle) {
            this.brouillon.vecu = document.sid;
            await this.#enregistrer();
            if (this.brouillon.vecu != null) this.#deplier(document);
        } else {
            const refus = await incarnations.ajouterVecu(this.cle, document.sid);
            if (refus != null) ui.notifications.warn(refus);
            else this.#deplier(document);
        }
        this.#rafraichir();
    }

    /**
     * Une acquisition déposée : la feature de l'item la rattache à l'incarnation.
     */
    static async #onDropAcquisition(event, document) {
        if (document.parent != null) return;
        if (this.nouvelle) {
            ui.notifications.warn(game.i18n.localize("NEPHILIM.incarnationAvantAcquis"));
            return;
        }
        await new FeatureBuilder(this.actor)
            .withOriginalItem(document.sid)
            .withPeriode(this.cle)
            .create()
            ?.drop();
        // L'onglet ne s'ouvre que si l'objet a bien été rattaché (un dépôt peut être refusé)
        if (new Incarnations(this.actor).rattaches(this.cle).some(i => i.sid === document.sid)) {
            this.#deplier(document);
        }
        this.#rafraichir();
    }

    /**
     * Retire un item de l'incarnation : il ne quitte la figure que s'il ne doit plus rien à
     * aucune autre incarnation.
     */
    static async #onRetirer(event, target) {
        if (this.locked) return;

        // Le vécu d'un brouillon n'existe pas encore sur la figure : on l'oublie seulement
        if (this.nouvelle) {
            if (target.closest('.item')?.dataset.sid === this.brouillon.vecu) {
                this.brouillon.vecu = null;
                this.render();
            }
            return;
        }

        const item = this.actor.items.get(target.closest('.item').dataset.id);
        if (item == null) return;
        const incarnations = new Incarnations(this.actor);
        if (item.type === 'vecu') {
            await incarnations.retirerVecu(this.cle, item.sid);
            this.#rafraichir();
            return;
        }
        // Un focus, une capacité : seul l'exemplaire de cette incarnation part ; tout autre
        // item ne quitte la figure que s'il ne doit plus rien à aucune incarnation
        await incarnations.retirerDe(item, this.cle);
        this.#rafraichir();
    }

    /**
     * Ouvre la fiche d'un item de l'incarnation, par sa feature, comme l'onglet incarnations.
     */
    static async #onOuvrir(event, target) {
        const node = target.closest('.item');
        if (node?.dataset.id == null) return;
        await new FeatureBuilder(this.actor)
            .withScope("actor")
            .withEmbeddedItem(node.dataset.id)
            .withOriginalItem(node.dataset.sid)
            .create()
            ?.editEmbeddedItem();
    }

    /**
     * Ouvre la fiche de la période du monde : elle n'a pas de copie sur la figure.
     */
    static async #onOuvrirPeriode(event, target) {
        const sid = target.closest('[data-sid]')?.dataset.sid;
        game.items.find(i => i.type === 'periode' && i.sid === sid)?.sheet.render(true);
    }

    /**
     * Supprime l'incarnation ouverte, après confirmation, et ramène à la fiche de la figure.
     * Un brouillon n'est que refermé : rien n'est encore enregistré.
     */
    static async #onSupprimer(event, target) {
        if (this.locked) return;
        if (this.nouvelle) {
            await this.close();
            return;
        }
        const incarnations = new Incarnations(this.actor);
        const periode = game.items.find(i => i.type === 'periode' && i.sid === incarnations.periodeDe(this.cle));
        const confirme = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize("NEPHILIM.supprimerIncarnation") },
            content: "<p>" + game.i18n.format("NEPHILIM.supprimerIncarnationConfirmation",
                { periode: periode?.name ?? incarnations.incarnation(this.cle)?.name ?? "" }) + "</p>",
            rejectClose: false,
            modal: true
        });
        if (confirme !== true) return;
        const cle = this.cle;
        this.cle = null;
        await this.close();
        await this.actor.deleteIncarnation(cle);
        this.actor.sheet?.render(true);
    }

    /**
     * Enregistre le brouillon dès que sa période est définie, avec le vécu déjà déposé s'il y
     * en a un.
     */
    async #enregistrer() {
        if (this.brouillon.periode == null) return;
        const incarnations = new Incarnations(this.actor);
        if (this.brouillon.vecu == null) {
            this.cle = await incarnations.ajouter(this.brouillon.periode);
            return;
        }
        const { cle, refus } = await incarnations.creerAvecVecu(this.brouillon.periode, this.brouillon.vecu, this.brouillon.degre);
        if (refus != null) {
            ui.notifications.warn(refus);
            this.brouillon.vecu = null;
            return;
        }
        this.cle = cle;
    }

    /**
     * Redessine le formulaire, et la fiche de la figure si elle est ouverte.
     */
    #rafraichir() {
        this.render();
        this.actor.sheet?.render(false);
    }

}
