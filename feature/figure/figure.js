import { Chute } from "../../feature/periode/chute.js";
import { CombatantMixinSheet } from "../../module/common/combatantSheetMixin.js";
import { Constants } from "../../module/common/constants.js";
import { FeatureBuilder } from "../../feature/core/featureBuilder.js";
import { Game } from "../../module/common/game.js";
import { HistoricalSheet } from "../../module/actor/historical.js";
import { NephilimActorSheet } from "../../module/actor/nephilimActorSheet.js";
import { OptionsSelector } from "./optionsSelector.js";
import { Science } from "../../feature/science/science.js";


export class FigureSheet extends CombatantMixinSheet(HistoricalSheet) {

    static DEFAULT_OPTIONS = {
        position: {
            width: 1070,
            height: 950
        },
        actions: {
            openItem: FigureSheet._onOpenItem,
            roll: FigureSheet._onRollItem,
            changeFocus: FigureSheet._onChangeFocus,
            changeStatus: FigureSheet._onChangeStatus,
            changePacte: FigureSheet._onChangePacte,
            selectLaboratory: FigureSheet._onSelectLaboratory,
            deleteLaboratory: FigureSheet._onDeleteLaboratory,
            construct: FigureSheet._onConstruct,
            editCapacity: FigureSheet._onEditCapacity,
            openSimulacre: FigureSheet._onOpenSimulacre,
            openFraternite: FigureSheet._onOpenFraternite,
        },
        dropHandlers: {
            magie: FigureSheet._onDropScience,
            alchimie: FigureSheet._onDropScience,
            sort: FigureSheet._onDropFocus,
            invocation: FigureSheet._onDropFocus,
            formule: FigureSheet._onDropFocus,
            figure: FigureSheet._onDropLaboratory,
            materiae: FigureSheet._onDropScience,
            catalyseur: FigureSheet._onDropScience,
            metamorphe: FigureSheet._onDropScience,
            chute: FigureSheet._onDropFocus,
            aspect: FigureSheet._onDropScience,
            science: FigureSheet._onDropFocus,
            rite: FigureSheet._onDropFocus,
            appel: FigureSheet._onDropFocus,
            habitus: FigureSheet._onDropFocus,
            dracomachie: FigureSheet._onDropFocus,
            divination: FigureSheet._onDropFocus,
            technique: FigureSheet._onDropFocus,
            tekhne: FigureSheet._onDropFocus,
            pratique: FigureSheet._onDropFocus,
            rituel: FigureSheet._onDropFocus,
            atlanteide: FigureSheet._onDropFocus,
            capacite: FigureSheet._onDropFocus,
            competence: FigureSheet._onDropManoeuver,
            vecu: FigureSheet._onDropManoeuver,
            figurant: FigureSheet._onDropSimulacre,
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/figure/figure.html`,
        }
    }

    static TABS = {
        primary: {
            tabs: [
                { id: "description", template: `systems/neph5e/feature/figure/description.hbs` }
            ],
            initial: "description"
        }
    }

    /**
     * @constructor
     * @param args
     */
    constructor(...args) {
        super(...args);
        this.editedCapacity = null;
    }

    /**
     * @override
     **/
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.editedCapacity = this.editedCapacity;
        return context;
    }

    /**
     * @override
     **/
    _getTabsConfig(group) {
        if (group !== "primary") return super._getTabsConfig(group);
        const tabs = [{
            id: "description",
            template: `systems/neph5e/feature/figure/description.hbs`
        }];
        const o = this.document.system.options ?? {};
        if (o.nephilim) {
            tabs.push({
                id: "nephilim",
                template: `systems/neph5e/feature/nephilim/actor/main.hbs`
            });
        }
        if (o.selenim) {
            tabs.push({
                id: "selenim",
                template: `systems/neph5e/feature/selenim/actor/main.hbs`
            });
        }
        if (o.combat) {
            tabs.push({
                id: "combat",
                template: `systems/neph5e/feature/figure/combat.hbs`
            });
        }
        if (o.incarnations) {
            tabs.push({
                id: "incarnations",
                template: `systems/neph5e/feature/figure/incarnations.hbs`,
                from: "figure"
            });
        }
        if (o.vecus) {
            tabs.push({
                id: "vecus",
                template: `systems/neph5e/feature/figure/vecus.hbs`,
                from: "figure"
            });
        }
        if (o.magie) {
            tabs.push({
                id: "magie",
                template: `systems/neph5e/feature/science/actor/science.hbs`,
                science: "magie",
                header: Science._getHeader("magie")
            });
        }
        if (o.kabbale) {
            tabs.push({
                id: "kabbale",
                template: `systems/neph5e/feature/science/actor/science.hbs`,
                science: "kabbale",
                header: Science._getHeader("kabbale")
            });
            tabs.push({
                id: "arbre",
                template: `systems/neph5e/feature/kabbale/actor/arbre.hbs`
            });
            if (this.document.ordonnances.items.length > 0) {
                tabs.push({
                    id: "ordonnances",
                    template: `systems/neph5e/feature/kabbale/actor/ordonnances.hbs`
                });
            }
        }
        if (o.alchimie) {
            tabs.push({
                id: "alchimie",
                template: `systems/neph5e/feature/science/actor/science.hbs`,
                science: "alchimie",
                header: Science._getHeader("alchimie")
            });
            tabs.push({
                id: "laboratoire",
                template: `systems/neph5e/feature/alchimie/actor/laboratoire.hbs`,
                cercles: Game.alchimie.cercles
            });
            tabs.push({
                id: "materiae",
                template: `systems/neph5e/feature/alchimie/actor/materiae.hbs`,
                catalyseurs: game.settings.get('neph5e', 'catalyseurs')
            });
        }
        if (o.analogie) {
            tabs.push({
                id: "analogie",
                template: `systems/neph5e/feature/science/actor/science.hbs`,
                science: "analogie",
                header: Science._getHeader("analogie")
            });
        }
        if (o.dracomachie) {
            tabs.push({
                id: "dracomachie",
                template: `systems/neph5e/feature/science/actor/science.hbs`,
                science: "dracomachie",
                header: Science._getHeader("dracomachie")
            });
        }
        if (o.atlanteide) {
            tabs.push({
                id: "atlanteide",
                template: `systems/neph5e/feature/science/actor/science.hbs`,
                science: "atlanteide",
                header: Science._getHeader("atlanteide")
            });
        }
        if (o.necromancie) {
            tabs.push({
                id: "necromancie",
                template: `systems/neph5e/feature/science/actor/science.hbs`,
                science: "necromancie",
                header: Science._getHeader("necromancie")
            });
        }
        if (o.conjuration) {
            tabs.push({
                id: "conjuration",
                template: `systems/neph5e/feature/science/actor/science.hbs`,
                science: "conjuration",
                header: Science._getHeader("conjuration")
            });
        }
        if (o.akasha) {
            tabs.push({
                id: "akasha",
                template: `systems/neph5e/feature/akasha/actor/main.hbs`
            });
        }
        if (o.bohemien) {
            tabs.push({
                id: "bohemien",
                template: `systems/neph5e/feature/science/actor/science.hbs`,
                science: "bohemien",
                header: Science._getHeader("bohemien")
            });
        }
        if (o.baton) {
            tabs.push({
                id: "baton",
                template: `systems/neph5e/feature/science/actor/science.hbs`,
                science: "baton",
                header: Science._getHeader("baton")
            });
        }
        if (o.coupe) {
            tabs.push({
                id: "coupe",
                template: `systems/neph5e/feature/science/actor/science.hbs`,
                science: "coupe",
                header: Science._getHeader("coupe")
            });
        }
        if (o.denier) {
            tabs.push({
                id: "denier",
                template: `systems/neph5e/feature/science/actor/science.hbs`,
                science: "denier",
                header: Science._getHeader("denier")
            });
        }
        if (o.epee) {
            tabs.push({
                id: "epee",
                template: `systems/neph5e/feature/science/actor/science.hbs`,
                science: "epee",
                header: Science._getHeader("epee")
            });
        }
        if (o.capacites) {
            tabs.push({
                id: "capacites",
                template: `systems/neph5e/feature/periode/actor/capacites.hbs`,
                from: "figure"
            });
        }
        return { tabs, initial: "description" };
    }

    async setOptions(options) {
        await this.document.update({
            'system.options.theme': options.theme,
            'system.options.nephilim': options.nephilim,
            'system.options.magie': options.magie,
            'system.options.analogie': options.analogie,
            'system.options.kabbale': options.kabbale,
            'system.options.alchimie': options.alchimie,
            'system.options.dracomachie': options.dracomachie,
            'system.options.selenim': options.selenim,
            'system.options.necromancie': options.necromancie,
            'system.options.conjuration': options.conjuration,
            'system.options.luneNoire': options.luneNoire,
            'system.options.baton': options.baton,
            'system.options.coupe': options.coupe,
            'system.options.denier': options.denier,
            'system.options.epee': options.epee,
            'system.options.gestionLaboratoire': options.gestionLaboratoire,
            'system.options.daath': options.daath,
            'system.options.degatAutomatique': options.degatAutomatique,
            'system.options.defenseMJ': options.defenseMJ,
            'system.options.vecus': options.vecus,
            'system.options.incarnations': options.incarnations,
            'system.options.combat': options.combat,
            'system.options.capacites': options.capacites,
            'system.options.simulacre': options.simulacre,
            'system.options.soleil': options.soleil,
            'system.options.akasha': options.akasha,
            'system.options.fraternites': options.fraternites,
            'system.options.atlanteide': options.atlanteide,
            'system.options.bohemien': options.bohemien,
            'system.options.chronologieDescendante': options.chronologieDescendante,
            'system.options.degreGauche': options.degreGauche,
            'system.options.incarnationsOuvertes': options.incarnationsOuvertes
        });
        this.elapsedPeriodes = this._elapsedPeriodes();
        await this.render(true);
    }

    /**
     * @override
     */
    get setupable() {
        return true;
    }

    /**
     * @override
     */
    async _onSetup(event, target) {
        await new OptionsSelector()
            .withSheet(this)
            .render(true);
    }

    /** @override */
    async _onRender(context, options) {
        await super._onRender(context, options);
        for (const el of this.element.querySelectorAll('.focus-quantite')) {
            el.addEventListener('change', this._onChangeQuantite.bind(this));
        }
        for (const el of this.element.querySelectorAll('.focus-transporte')) {
            el.addEventListener('change', this._onChangeTransporte.bind(this));
        }
        for (const el of this.element.querySelectorAll('li.materiae .quantite')) {
            el.addEventListener('change', this._onChangeMateriae.bind(this));
        }
        for (const el of this.element.querySelectorAll('.chutes .degres i')) {
            el.addEventListener('click', this._onChute.bind(this));
        }
        for (const el of this.element.querySelectorAll('.metamorphose .formed, .metamorphose .visible')) {
            el.addEventListener('click', this._onToggleMetamorphose.bind(this));
        }
        for (const el of this.element.querySelectorAll('.element .dice')) {
            el.addEventListener('click', this._onRollKa.bind(this));
        }
        for (const el of this.element.querySelectorAll('.aspect .visible')) {
            el.addEventListener('click', this._onToggleAspect.bind(this));
        }
        for (const el of this.element.querySelectorAll('[data-tab="akasha"] .activate')) {
            el.addEventListener('click', this._onToggleVaisseau.bind(this));
        }
    }



    // Roll combat
    async _onRoll(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const arme = this.actor.items.get(id);
        const uuid = arme.system.competence;
        const skill = game.items.find(i => i.sid === uuid);
        if (skill === undefined) {
            ui.notifications.warn(game.i18n.localize('NEPH5E.noWeaponSkill'));
        } else {
            return await skill.roll(this.actor);
        }
    }

    /** Bascule l'état formed/visible d'une métamorphose. */
    async _onToggleMetamorphose(event) {
        if (this.locked) return;
        const node = event.currentTarget.closest('.metamorphose');
        const item = game.items.get(node.dataset.id);
        const index = parseInt(node.dataset.index);
        const feature = new FeatureBuilder(this.document).withOriginalItem(item.sid).create();
        if (event.currentTarget.classList.contains('formed')) {
            await feature.toggleFormed(index);
        } else {
            await feature.toggleVisible(index);
        }
    }

    /** Fixe le degré d'une chute (clic sur un cercle). */
    async _onChute(event) {
        if (this.locked) return;
        if (this.document.system.periode == null) return;
        const target = event.currentTarget;
        const type = ['khaiba', 'narcose', 'ombre', 'luneNoire'].find(t => target.classList.contains(t));
        await new Chute(this.document).set(type, parseInt(target.dataset.id));
    }

    /** Bascule l'état actif d'un aspect de l'imago. */
    async _onToggleAspect(event) {
        if (this.locked) return;
        const sid = event.currentTarget.closest('.item').dataset.sid;
        await new FeatureBuilder(this.document).withOriginalItem(sid).create().toggleActive();
    }

    /** Jet de Ka sur un élément du pentacle. */
    async _onRollKa(event) {
        const element = event.currentTarget.closest('.element').dataset.id;
        const feature = new FeatureBuilder(this.document).withScope('actor').withKa(element).create();
        await feature.initializeRoll();
    }

    /** Construit la feature à partir de l'élément cliqué (AppV2). */
    _featureFromTarget(target) {
        const node = target.closest('.item');
        const id = node.dataset.id;
        const sid = node.dataset.sid;
        const scope = node.dataset.scope ?? "actor";
        return new FeatureBuilder(this.document)
            .withScope(scope)
            .withEmbeddedItem(id)
            .withOriginalItem(sid)
            .create();
    }

    /** Ouvre la fiche de l'item (vécu, savoir, quête, compétence...). */
    static async _onOpenItem(event, target) {
        const feature = this._featureFromTarget(target);
        await feature.editEmbeddedItem();
    }

    /** Lance le jet de l'item. */
    static async _onRollItem(event, target) {
        const feature = this._featureFromTarget(target);
        await feature.initializeRoll();
    }

    /** Modifie la quantité totale de vaisseaux alchimiques  */
    async _onChangeQuantite(event) {
        if (this.locked) return;
        const sid = event.target.closest('.item').dataset.sid;
        const item = this.document.items.find(i => i.sid === sid);
        await item.update({ ['system.quantite']: parseInt(event.target.value) });
    }

    /** Modifie la quantité transportées de vaisseaux alchimiques  */
    async _onChangeTransporte(event) {
        if (this.locked) return;
        const sid = event.target.closest('.item').dataset.sid;
        const item = this.document.items.find(i => i.sid === sid);
        await item.update({ ['system.transporte']: parseInt(event.target.value) });
    }

    /** Toggle le pacte de l'invocation. */
    static async _onChangePacte(event, target) {
        if (this.locked) return;
        const sid = target.closest('.item').dataset.sid;
        const item = this.document.items.find(i => i.sid === sid);
        await item.update({ ['system.pacte']: !item.system.pacte });
    }

    /** Toggle la possession du focus (icône parchemin). */
    static async _onChangeFocus(event, target) {
        if (this.locked) return;
        const sid = target.closest('.item').dataset.sid;
        const item = this.document.items.find(i => i.sid === sid);
        await item.update({ ['system.focus']: !item.system.focus });
    }

    /** Cycle le statut : connu → déchiffré → appris → tatoué → connu. */
    static async _onChangeStatus(event, target) {
        if (this.locked) return;
        const sid = target.closest('.item').dataset.sid;
        const item = this.document.items.find(i => i.sid === sid);
        switch (item.system.status) {
            case Constants.CONNU:     await item.update({ ['system.status']: Constants.DECHIFFRE }); break;
            case Constants.DECHIFFRE: await item.update({ ['system.status']: Constants.APPRIS });   break;
            case Constants.APPRIS:    await item.update({ ['system.status']: Constants.TATOUE });    break;
            case Constants.TATOUE:    await item.update({ ['system.status']: Constants.CONNU });     break;
            default: throw new Error("Status " + item.system.status + " not implemented");
        }
    }

    /** Drop d'une voie de science (magie, kabbale, ...) : embarque la voie. */
    static async _onDropScience(event, document) {
        await new FeatureBuilder(this.document)
            .withOriginalItem(document.sid)
            .create()
            .drop();
        await this.render(true);
    }

    /** Drop d'un focus (sort, ...) : rattaché à la période courante.
     *  Si le focus existait déjà sur une autre période, il est déplacé (une seule période). */
    static async _onDropFocus(event, document) {
        await new FeatureBuilder(this.document)
            .withOriginalItem(document.sid)
            .withPeriode(this.document.system.periode)
            .create()
            .drop();
        await this.render(true);
    }

    static async _onDropManoeuver(event, document) {
        if (this.editedCapacity == null) return;
        const builder = new FeatureBuilder(this.document)
            .withScope('actor')
            .withManoeuver(this.editedCapacity);
        const feature = (document.isEmbedded
            ? builder.withEmbeddedItem(document.id)
            : builder.withOriginalItem(document.sid)).create();
        await feature.drop();
        this.editedCapacity = null;
        await this.render(true);
    }

    /**
     * Drop d'un figurant sur la figure : le définit comme simulacre.
     */
    static async _onDropSimulacre(event, document) {
        if (this.document.system.options?.simulacre !== true) return;
        await this.document.update({ ['system.simulacre']: document.sid });
    }

    /**
     * Ouvre la fiche de l'acteur simulacre.
     */
    static async _onOpenSimulacre(event, target) {
        await this.document.simulacre?.sheet.render(true);
    }

    /**
     * Ouvre la fiche de la fraternité cliquée.
     */
    static async _onOpenFraternite(event, target) {
        const id = target.closest("[data-id]")?.dataset.id;
        const fraternite = game.actors.get(id);
        await fraternite?.sheet.render(true);
    }


    async _onToggleVaisseau(event) {
        event.preventDefault();
        if (this.locked) return;
        const vaisseau = event.currentTarget.closest('.vaisseau').dataset.type;
        const activated = this.document.system.akasha[vaisseau].active;
        await this.document.update({ ['system.akasha.' + vaisseau + '.active']: !activated });
    }

    static async _onEditCapacity(event, target) {
        event.preventDefault();
        const capacity = target.closest('.capacite').dataset.id;
        this.editedCapacity = this.editedCapacity === capacity ? null : capacity;
        await this.render(true);
    }

    /** Active/désactive un construct (seulement sur son propre labo, déverrouillé). */
    static async _onConstruct(event, target) {
        if (this.document.system.alchimie.courant == null && this.locked === false) {
            const construct = target.closest('.tooltip').dataset.type;
            const activated = this.document.system.alchimie.constructs[construct].active;
            await this.document.update({ ['system.alchimie.constructs.' + construct + ".active"]: !activated });
        }
    }

    /** Ajoute un laboratoire en déposant un acteur alchimiste sur l'onglet laboratoire. */
    static async _onDropLaboratory(event, document) {
        if (this.tabGroups.primary !== 'laboratoire') return;
        const laboratoires = this.document.system.alchimie.laboratoires;
        if (!laboratoires.includes(document.sid)) {
            await this.document.update({
                ['system.alchimie.laboratoires']: [...laboratoires, document.sid]
            });
        }
    }

    /** Sélectionne un laboratoire (le sien si pas de data-sid). */
    static async _onSelectLaboratory(event, target) {
        const sid = target.dataset.sid;
        await this.document.update({ ['system.alchimie.courant']: sid == null ? null : sid });
    }

    /** Supprime le laboratoire courant. */
    static async _onDeleteLaboratory(event, target) {
        const sid = this.document.system.alchimie.courant;
        const labs = this.document.system.alchimie.laboratoires.filter(i => i !== sid);
        await this.document.update({ ['system.alchimie.laboratoires']: labs });
        await this.document.update({ ['system.alchimie.courant']: null });
    }

    /** Édite la quantité d'une materia (input .quantite de la liste). */
    async _onChangeMateriae(event) {
        if (this.locked) return;
        const sid = event.target.closest('.item').dataset.sid;
        const item = this.document.items.find(i => i.sid === sid);
        await item.update({ ['system.quantite']: parseInt(event.target.value) });
    }

    /**
     * @override
     * Materiae primae : le champ 'max' ne stocke que le delta à ajouter au maximum théorique.
     */
    async _onSubmit(event, form, formData) {
        for (const elt of ['air', 'eau', 'feu', 'lune', 'terre']) {
            const key = 'system.alchimie.primae.' + elt + '.max';
            const input = formData.object[key];
            if (input !== undefined) {
                formData.object[key] = input - this.document.getMaxBaseMP(elt);
            }
        }
        // Délègue à NephilimActorSheet (system.id, items embarqués, update acteur).
        await super._onSubmit(event, form, formData);
    }

}