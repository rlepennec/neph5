import { DragDropMixin } from "../../module/common/dragDropMixin.js";
import { FeatureBuilder } from "../core/featureBuilder.js";
import { Incarnations } from "./incarnations.js";
import { LockableMixin } from "../../module/common/lockableMixin.js";
import { Version } from "../../module/common/version.js";

/**
 * Le formulaire d'une incarnation de figure, ouvert depuis l'onglet incarnations.
 *
 * On y définit l'incarnation par glisser-déposer depuis le monde :
 *   1. une période — elle remplace celle de l'incarnation, et son vécu la suit ;
 *   2. un vécu — il remplace celui de l'incarnation et prend sa période ; son degré se règle
 *      dans le formulaire ;
 *   3. un savoir, une quête, un arcane, une science, une passe d'armes, une chute — acquis
 *      pendant l'incarnation, avec le degré acquis ;
 *   4. un focus (formule, sort, invocation...) ou une capacité — rattachés à l'incarnation.
 * Le formulaire liste ce qui est défini, avec les degrés.
 *
 * Une incarnation NOUVELLE n'existe d'abord qu'ici, à l'état de brouillon : elle n'est
 * enregistrée que lorsque sa période et son vécu sont tous deux définis. Les acquisitions
 * (3, 4) ne se déposent qu'ensuite, sur une incarnation enregistrée.
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
            context.vecu = vecu == null ? null : { name: vecu.name, img: vecu.img, degre: this.brouillon.degre };
        } else {
            const vecu = incarnations.vecuDe(this.cle);
            context.vecu = vecu == null ? null : { id: vecu.id, sid: vecu.sid, name: vecu.name, img: vecu.img, degre: Version.data(vecu).degre ?? 0 };
        }

        // Ce qui a été acquis pendant l'incarnation
        const ligne = (item, degre) => ({
            id: item.id,
            sid: item.sid,
            name: item.name,
            img: item.img,
            type: game.i18n.localize("TYPES.Item." + item.type),
            degre: degre ? incarnations.degreDans(item.sid, this.cle) : null
        });
        context.acquis = this.nouvelle ? [] : incarnations.rattaches(this.cle, IncarnationForm.AVEC_DEGRE).map(i => ligne(i, true));
        context.focus = this.nouvelle ? [] : incarnations.rattaches(this.cle, IncarnationForm.SANS_DEGRE).map(i => ligne(i, false));

        return context;
    }

    /**
     * Les degrés saisis : celui du vécu (« vecu »), et ceux des acquisitions (« degre.<sid> »).
     * Seules les valeurs qui changent sont écrites.
     */
    static async #onSubmit(event, form, formData) {
        if (this.locked) return;
        const valeurs = foundry.utils.expandObject(formData.object);
        const entier = (v) => { const n = parseInt(v); return isNaN(n) ? 0 : n; };

        if (this.nouvelle) {
            if (valeurs.vecu !== undefined) this.brouillon.degre = entier(valeurs.vecu);
            return;
        }

        const incarnations = new Incarnations(this.actor);
        const vecu = incarnations.vecuDe(this.cle);
        if (vecu != null && valeurs.vecu !== undefined && entier(valeurs.vecu) !== (Version.data(vecu).degre ?? 0)) {
            await incarnations.modifierDegre(vecu, entier(valeurs.vecu), this.cle);
        }
        for (const [sid, valeur] of Object.entries(valeurs.degre ?? {})) {
            const item = incarnations.exemplaires(sid)[0];
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
     * Le vécu déposé : celui du brouillon, ou le nouveau vécu de l'incarnation.
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
        } else {
            const refus = await incarnations.definirVecu(this.cle, document.sid);
            if (refus != null) ui.notifications.warn(refus);
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
        this.#rafraichir();
    }

    /**
     * Retire un item de l'incarnation : il ne quitte la figure que s'il ne doit plus rien à
     * aucune autre incarnation.
     */
    static async #onRetirer(event, target) {
        if (this.locked || this.nouvelle) return;
        const item = this.actor.items.get(target.closest('.item').dataset.id);
        if (item == null) return;
        if (await new Incarnations(this.actor).detacher(item.sid, this.cle) === 0) {
            await this.actor.deleteEmbeddedItem(item);
        }
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
     * Enregistre le brouillon dès que sa période et son vécu sont définis.
     */
    async #enregistrer() {
        if (this.brouillon.periode == null || this.brouillon.vecu == null) return;
        const { cle, refus } = await new Incarnations(this.actor)
            .creerAvecVecu(this.brouillon.periode, this.brouillon.vecu, this.brouillon.degre);
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
