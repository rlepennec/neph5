import { droppedItem } from "../../common/tools.js";
import { CustomHandlebarsHelpers } from "../../common/handlebars.js";
import { getByPath } from "../../common/tools.js";
import { UUID } from "../../common/tools.js";
import { Game } from "../../common/game.js";
import { deleteItemOf } from "../../common/tools.js";
import { droppedActor } from "../../common/tools.js";
import { BaseSheet } from "./base.js";

export class FigureSheet extends BaseSheet {

    /**
     * @constructor
     * @param  {...any} args
     */
    constructor(...args) {
        super(...args);
        this.current = null; // The current editable periode
        this.current_i = null;
    }

    /**
     * @return the path of the specified actor sheet.
     */
    get template() {
        return 'systems/neph5e/templates/actor/figure.html';
    }

    /**
     * @override
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 900,
            height: 800,
            classes: ["nephilim", "sheet", "actor"],
            resizable: true,
            scrollY: [
                ".tab.description",
                ".tab.vecus",
                ".tab.simulacre",
                ".tab.nephilim",
                ".tab.magie",
                ".tab.kabbale",
                ".tab.alchimie",
                ".tab.laboratoire",
                ".tab.akasha",
                ".tab.selenim",
                ".tab.necromancie",
                ".tab.conjuration",
                ".tab.baton",
                ".tab.coupe",
                ".tab.denier",
                ".tab.epee",
                ".tab.incarnations",
                ".tab.options"],
            tabs: [
                {
                    navSelector: ".tabs",
                    contentSelector: ".sheet-body",
                    initial: "vecus"
                }]
        });
    }

    getData() {
        const baseData = super.getData();
        let sheetData = {
            owner: this.actor.isOwner,
            editable: this.isEditable,
            actor: baseData.actor,
            data: baseData.actor.data.data,
            metamorphes: game.items.filter(item => item.data.type === 'metamorphe'),
            cercles: Game.alchimie.cercles,
            currentPeriode: this.current != null ? this.current.data.data.id : null,
            useV3: game.settings.get('neph5e', 'useV3'),
            useCombatSystem: game.settings.get('neph5e', 'useCombatSystem'),
            effects: {
                desoriente: this?.token?.combatant?.effectIsActive(Game.effects.desoriente),
                immobilise: this?.token?.combatant?.effectIsActive(Game.effects.immobilise),
                projete: this?.token?.combatant?.effectIsActive(Game.effects.projete)
            },
            initiative: baseData.actor.data.data.ka.eau * 2,
            bonusDommage: Math.floor(baseData.actor.data.data.ka.feu / 5),
            perspicacite: 11 - baseData.actor.data.data.ka.air,
            recuperation: 11 - baseData.actor.data.data.ka.terre,
            voile: Math.floor(baseData.actor.data.data.ka.lune / 5)
        }
        return sheetData;
    }

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);

        // Combat
        html.find('div[data-tab="combat"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="combat"] .item-edit').click(this._onEditEquipement.bind(this));
        html.find('div[data-tab="combat"] .item-delete').click(this._onDeleteEquipement.bind(this));
        html.find('div[data-tab="combat"] .item-roll').click(this._onRoll.bind(this));
        html.find('div[data-tab="combat"] .item-attack').click(this._onAttack.bind(this));
        html.find('div[data-tab="combat"] .item-wrestle').click(this._onWrestle.bind(this));
        html.find('div[data-tab="combat"] .item-move').click(this._onMove.bind(this));
        html.find('div[data-tab="combat"] .item-use').click(this._onUseItem.bind(this));
        html.find('div[data-tab="combat"] #desoriente').click(this._onDesoriente.bind(this));
        html.find('div[data-tab="combat"] #immobilise').click(this._onImmobilise.bind(this));
        html.find('div[data-tab="combat"] #projete').click(this._onProjete.bind(this));

        // Simulacre
        html.find('div[data-tab="simulacre"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="simulacre"] .item-roll').click(this._onSimulacreRoll.bind(this));

        // Nephilim
        html.find('div[data-tab="nephilim"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="nephilim"] .item-roll').click(this._onNephilimRoll.bind(this));

        // Vecus
        html.find('div[data-tab="vecus"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="vecus"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="vecus"] .item-rolls').click(this._onSimulacreOfRoll.bind(this));

        // Magie
        html.find('div[data-tab="magie"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="magie"] .item-name').click(this._onShowSort.bind(this));
        html.find('div[data-tab="magie"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="magie"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="magie"] .item-delete').click(this._onDeleteItem.bind(this));

        // Kabbale
        html.find('div[data-tab="kabbale"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="kabbale"] .item-name').click(this._onShowInvocation.bind(this));
        html.find('div[data-tab="kabbale"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="kabbale"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="kabbale"] .item-delete').click(this._onDeleteItem.bind(this));

        // Alchimie
        html.find('div[data-tab="alchimie"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="alchimie"] .item-name').click(this._onShowFormule.bind(this));
        html.find('div[data-tab="alchimie"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="alchimie"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="alchimie"] .item-delete').click(this._onDeleteItem.bind(this));

        // Laboratoire
        html.find('div[data-tab="laboratoire"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="laboratoire"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="laboratoire"] .item-delete').click(this._onDeleteItem.bind(this));

        // Incarnations
        html.find('div[data-tab="incarnations"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="incarnations"] .item-edit').click(this._onEditIncarnations.bind(this));
        html.find('div[data-tab="incarnations"] .item-delete').click(this._onDeleteIncarnations.bind(this));

        // Selenim
        html.find('div[data-tab="selenim"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="selenim"] .item-roll').click(this._onSelenimRoll.bind(this));
        html.find('div[data-tab="selenim"] .item-name').click(this._onShowAspect.bind(this));
        html.find('div[data-tab="selenim"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="selenim"] .item-delete').click(this._onDeleteItem.bind(this));

        // Conjuration
        html.find('div[data-tab="conjuration"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="conjuration"] .item-name').click(this._onShowAppel.bind(this));
        html.find('div[data-tab="conjuration"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="conjuration"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="conjuration"] .item-delete').click(this._onDeleteItem.bind(this));

        // Necromancie
        html.find('div[data-tab="necromancie"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="necromancie"] .item-name').click(this._onShowRite.bind(this));
        html.find('div[data-tab="necromancie"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="necromancie"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="necromancie"] .item-delete').click(this._onDeleteItem.bind(this));

        // Baton
        html.find('div[data-tab="baton"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="baton"] .item-name').click(this._onShowTechnique.bind(this));
        html.find('div[data-tab="baton"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="baton"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="baton"] .item-delete').click(this._onDeleteItem.bind(this));

        // Coupe
        html.find('div[data-tab="coupe"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="coupe"] .item-name').click(this._onShowTekhne.bind(this));
        html.find('div[data-tab="coupe"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="coupe"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="coupe"] .item-delete').click(this._onDeleteItem.bind(this));

        // Denier
        html.find('div[data-tab="denier"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="denier"] .item-name').click(this._onShowPratique.bind(this));
        html.find('div[data-tab="denier"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="denier"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="denier"] .item-delete').click(this._onDeleteItem.bind(this));

        // Epee
        html.find('div[data-tab="epee"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="epee"] .item-name').click(this._onShowRituel.bind(this));
        html.find('div[data-tab="epee"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="epee"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="epee"] .item-delete').click(this._onDeleteItem.bind(this));
    }

    /**
     * This function catches the drop
     * @param {*} event 
     */
    async _onDrop(event) {

        // Catch and retrieve the dropped item
        event.preventDefault();
        const item = await droppedItem(event);
        if (item === null) {

            // Catch and retrieve the dropped actor
            const actor = await droppedActor(event);
            if (actor !== null && actor.hasOwnProperty('data')) {

                // The metamorphe has been dropped:
                //   - Update the reference of the metamorphe
                //   - Delete the metamorphoses
                if (actor.data.type === "simulacre" && actor.data.data.id != "") {
                    const simulacre = duplicate(this.actor.data.data.simulacre);
                    simulacre.refid = actor.data.data.id;
                    await this.actor.update({ ['data.simulacre']: simulacre });
                }
            }

        } else if (item.hasOwnProperty('data')) {

            // The armure or armure has been dropped:
            if (item.data.type === "arme" || item.data.type === "armure") {
                await super._onDrop(event);

                // The metamorphe has been dropped:
                //   - Update the reference of the metamorphe
                //   - Delete the metamorphoses
            } else if (item.data.type === "metamorphe") {
                const metamorphe = duplicate(this.actor.data.data.metamorphe);
                metamorphe.refid = item.data.data.id;
                metamorphe.metamorphoses = [false, false, false, false, false, false, false, false, false, false];
                metamorphe.manifested = [false, false, false, false, false, false, false, false, false, false];
                await this.actor.update({ ['data.metamorphe']: metamorphe });

                // The periode has been dropped:
                //   - Add the periode if added
                //   - Delete the periodes
            } else if (item.data.type === "periode") {
                const periodes = duplicate(this.actor.data.data.periodes);
                const index = periodes.findIndex(periode => (periode.refid === item.data.data.id));
                if (index === -1) {
                    const periode = {
                        refid: item.data.data.id,
                        active: true,
                        vecus: [],
                        savoirs: [],
                        quetes: [],
                        arcanes: [],
                        chutes: [],
                        passes: [],
                        sciences: []
                    };
                    periodes.push(periode);
                }
                await this.actor.update({ ['data.periodes']: periodes });

                // The ordonnance has been dropped:
                //   - Add the ordonnance if added
                //   - Delete the ordonnances
            } else if (item.data.type === "ordonnance") {
                const kabbale = duplicate(this.actor.data.data.kabbale);
                const index = kabbale.voie.ordonnances.findIndex(ordonnance => (ordonnance.refid === item.data.data.id));
                if (index === -1) {
                    const ordonnance = {
                        refid: item.data.data.id
                    };
                    kabbale.voie.ordonnances.push(ordonnance);
                }
                await this.actor.update({ ['data.kabbale']: kabbale });

                // The voie initiatique has been dropped:
                //   - Update the reference of the magie
                //   - Delete the magie
            } else if (item.data.type === "magie") {
                const magie = duplicate(this.actor.data.data.magie);
                magie.voie.refid = item.data.data.id;
                await this.actor.update({ ['data.magie']: magie });

                // The voie alchimique has been dropped:
                //   - Update the reference of the alchimie
                //   - Delete the alchimie
            } else if (item.data.type === "alchimie") {
                const alchimie = duplicate(this.actor.data.data.alchimie);
                alchimie.voie.refid = item.data.data.id;
                await this.actor.update({ ['data.alchimie']: alchimie });

            } else {

                switch (item.data.type) {
                    case 'vecu':
                        if (event.currentTarget.getElementsByClassName('tab incarnations active').length === 1) {
                            await this._onDropInPeriode(item, 'vecus', {});
                        }
                        break;
                    case 'savoir':
                    case 'quete':
                    case 'arcane':
                    case 'chute':
                    case 'passe':
                        await this._onDropInPeriode(item, item.data.type + 's', {});
                        break;
                    case 'science':
                        await this._onDropInPeriode(item, 'sciences', { ref: item.data.data.ref });
                        break;
                    case 'sort':
                        await this._onDropSort(item, 'magie', 'sorts', { focus: true, appris: false, tatoue: false });
                        break;
                    case 'invocation':
                        await this._onDropSort(item, 'kabbale', 'invocations', { focus: true, appris: false, tatoue: false, pacte: false, feal: 0, allie: 0 });
                        break;
                    case 'formule':
                        await this._onDropSort(item, 'alchimie', 'formules', { focus: true, appris: false, tatoue: false, quantite: 0, transporte: 0 });
                        break;
                    case 'materiae':
                        await this._onDropSort(item, 'alchimie', 'materiae', { quantite: 0 });
                        break;
                    case 'catalyseur':
                        await this._onDropSort(item, 'alchimie', 'catalyseurs', {});
                        break;
                    case 'aspect':
                        await this._onDropSort(item, 'imago', 'aspects', {});
                        break;
                    case 'appel':
                        await this._onDropSort(item, 'conjuration', 'appels', {});
                        break;
                    case 'rite':
                        await this._onDropSort(item, 'necromancie', 'rites', {});
                        break;
                    case 'pratique':
                        await this._onDropSort(item, 'denier', 'pratiques', {});
                        break;
                    case 'technique':
                        await this._onDropSort(item, 'baton', 'techniques', {});
                        break;
                    case 'tekhne':
                        await this._onDropSort(item, 'coupe', 'tekhnes', {});
                        break;
                    case 'rituel':
                        await this._onDropSort(item, 'epee', 'rituels', {});
                        break;

                }

            }

        }

    }

    /**
     * Add the specified item in the specified periode.
     * @param {*} item             The sort to add.
     * @param {*} collection       The collection of items in which to add the item.
     *  @param {Object} properties The properties to add to the item before adding.
     */
    async _onDropInPeriode(item, collection, properties) {
        if (this.current) {
            const periodes = duplicate(this.actor.data.data.periodes);
            const index = periodes.findIndex(p => (p.refid === this.current.data.data.id));
            if (index != -1) {
                if (periodes[index][collection].findIndex(i => (i.refid === item.data.data.id)) == -1) {
                    const i = {
                        refid: item.data.data.id,
                        degre: 0
                    }
                    Object.assign(i, properties);
                    periodes[index][collection].push(i);
                    await this.actor.update({ ['data.periodes']: periodes });
                }
            }
        }
    }

    /**
     * Add the specified item in the specified grimoire.
     * @param {*} item            The sort to add.
     * @param {*} science         The science occulte of the sort.
     * @param {*} grimoire        The collection of sort in which to add the item.
     * @param {Object} properties The properties to add to the sort before adding.
     */
    async _onDropSort(item, science, grimoire, properties) {
        const so = duplicate(this.actor.data.data[science]);
        const index = so[grimoire].findIndex(s => (s.refid === item.data.data.id));
        if (index === -1) {
            let s = {
                refid: item.data.data.id,
            };
            Object.assign(s, properties);
            so[grimoire].push(s);
        }
        await this.actor.update({ ['data.' + science]: so });
    }

    /**
     * @override
     */
    _updateObject(event, formData) {

        if (formData['data.id'] === "") {
            formData['data.id'] = UUID();
        }

        // Metamorphe
        // --------------------------------------------------------------------
        if (formData.hasOwnProperty("data.page.nephilim")) {
            const metamorphoses = [];
            const manifested = [];
            for (let index = 0; index < 10; index++) {
                const name = "data.metamorphoses.[" + index + "]";
                metamorphoses.push(formData[name]);
                delete formData[name];
            }
            for (let index = 0; index < 10; index++) {
                const name = "data.manifested.[" + index + "]";
                manifested.push(formData[name]);
                delete formData[name];
            }
            formData["data.metamorphe.metamorphoses"] = metamorphoses;
            formData["data.metamorphe.manifested"] = manifested;
        } else {
            formData["data.metamorphe.metamorphoses"] = this.actor.data.data.metamorphe.metamorphoses;
            formData["data.metamorphe.manifested"] = this.actor.data.data.metamorphe.manifested;
        }

        // Initialize the periodes of the actor
        // --------------------------------------------------------------------
        let periodes = [];
        if (formData.hasOwnProperty("data.page.incarnations")) {

            // For each periode of the actor
            for (let p of this.actor.data.data.periodes) {

                // Retrieve the name and the id of the periode
                const periodeName = "data.periodes.[" + p.refid + "]";

                const vecus = this._updatePeriode(p, 'vecus', formData, ['degre']);
                const savoirs = this._updatePeriode(p, 'savoirs', formData, ['degre']);
                const quetes = this._updatePeriode(p, 'quetes', formData, ['degre']);
                const arcanes = this._updatePeriode(p, 'arcanes', formData, ['degre']);
                const chutes = this._updatePeriode(p, 'chutes', formData, ['degre']);
                const passes = this._updatePeriode(p, 'passes', formData, ['degre']);
                const sciences = this._updatePeriode(p, 'sciences', formData, ['ref', 'degre']);

                periodes.push({
                    refid: formData[periodeName + ".refid"],
                    active: formData[periodeName + ".active"],
                    vecus: vecus,
                    savoirs: savoirs,
                    quetes: quetes,
                    arcanes: arcanes,
                    chutes: chutes,
                    passes: passes,
                    sciences: sciences
                });

                delete formData[periodeName + ".refid"];
                delete formData[periodeName + ".active"];

            }
        } else {
            periodes = this.actor.data.data.periodes;
        }
        formData["data.periodes"] = periodes;

        this._update('magie', 'magie.sorts', formData, ['focus', 'appris', 'tatoue']);
        this._update('kabbale', 'kabbale.invocations', formData, ['focus', 'appris', 'tatoue', 'pacte', 'feal', 'allie']);
        this._update('alchimie', 'alchimie.formules', formData, ['focus', 'appris', 'tatoue', 'quantite', 'transporte']);
        this._update('kabbale', 'kabbale.voie.ordonnances', formData, ['suivi']);
        this._update('laboratoire', 'alchimie.materiae', formData, ['quantite']);
        this._update('laboratoire', 'alchimie.catalyseurs', formData, []);
        this._update('selenim', 'imago.aspects', formData, ['active']);
        this._update('conjuration', 'conjuration.appels', formData, ['appris']);
        this._update('necromancie', 'necromancie.rites', formData, ['appris']);
        this._update('baton', 'baton.techniques', formData, []);
        this._update('coupe', 'coupe.tekhnes', formData, []);
        this._update('denier', 'denier.pratiques', formData, []);
        this._update('epee', 'epee.rituels', formData, []);

        // Update
        // --------------------------------------------------------------------
        super._updateObject(event, formData);

    }

    _updatePeriode(periode, collection, formData, properties) {
        const items = [];
        for (let i of periode[collection]) {
            const name = "data.periodes.[" + periode.refid + "]" + "." + collection + ".[" + i.refid + "]";
            const atts = properties;
            atts.push('refid');
            let item = {};
            for (let att of atts) {
                item[att] = formData[name + "." + att]
            }
            items.push(item);
            for (let att of atts) {
                delete formData[name + "." + att];
            }
        }
        return items;
    }

    _update(page, collection, formData, properties) {
        const items = getByPath(this.actor.data.data, collection);
        const size = items.length;
        let updated = [];
        if (formData.hasOwnProperty("data.page." + page)) {
            for (let index = 0; index < size; index++) {
                const name = "data." + collection + ".[" + index + "]";
                const atts = properties;
                atts.push('refid');
                let item = {};
                for (let p of atts) {
                    item[p] = formData[name + "." + p]
                }
                updated.push(item);
                for (let p of atts) {
                    delete formData[name + "." + p];
                }

            }
        } else {
            updated = items;
        }
        formData["data." + collection] = updated;
    }

    /**
     * This function catches the deletion of a ordonnance from the list of materiae primae.
     */

    async _onDeleteItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const science = li.data("item-science");
        const collection = li.data("item-collection");
        await deleteItemOf(this.actor, science, "refid", id, collection);
    }

    async _onDeleteEquipement(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        return await this.actor.deleteEmbeddedDocuments('Item', [li.data("item-id")]);
    }

    async _onEditEquipement(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = this.actor.getEmbeddedDocument('Item', id);
        item.sheet.render(true);
    }

    async _onDeleteIncarnations(event) {
        event.preventDefault();
        let li = $(event.currentTarget).parents(".item");
        if (li != undefined) {
            const id = li.data("item-id");
            if (id === undefined) {
                li = $(event.currentTarget).parents(".item-list-header");
                const id = li.data("item-id");
                const type = li.data("item-type");
                if (type == "periode") {
                    const item = CustomHandlebarsHelpers.getItem(id);
                    if (item === this.current) {
                        deleteItemOf(this.actor, "periodes", "refid", id);
                        this.current = null;
                        this.current_i = null;
                    }
                }
            } else {
                const periodeId = li.data("periode-id");
                const item = CustomHandlebarsHelpers.getItem(periodeId);
                if (this.current && item.data.data.id === this.current.data.data.id) {
                    const type = li.data("item-type");
                    const index = this.actor.data.data.periodes.findIndex(p => (p.refid === periodeId));
                    switch (type) {
                        case 'vecu':
                            const data = this.actor.data.data.periodes;
                            const i = data[index].vecus.findIndex(i => (i.refid === id));
                            data[index].vecus.splice(i, 1);
                            await this.actor.update({ ['data.periodes']: data });
                            break;
                        case 'savoir':
                        case 'quete':
                        case 'arcane':
                        case 'chute':
                        case 'passe':
                        case 'science':
                            await this.deleteItemOfIncarnations(index, type + 's', id);
                            break;

                    }
                }
            }
        }
    }

    async deleteItemOfIncarnations(periodeIndex, collection, id) {
        const data = duplicate(this.actor.data.data.periodes);
        const subdata = getByPath(data[periodeIndex], collection);
        const index = subdata.findIndex(a => a.refid === id);
        getByPath(data[periodeIndex], collection).splice(index, 1);
        await this.actor.update({ ["data.periodes"]: data });
    }

    async _onNephilimRoll(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const type = li.data("item-type");
        if (type === 'chute' || type === 'arcane') {
            return await this._onItemRoll(event);
        } else {
            return await this.actor.rollKa(id);
        }
    }

    async _onSelenimRoll(event) {
        const li = $(event.currentTarget).parents(".cercle");
        const id = li.data("item-id");
        if (id === 'noyau' || id === 'pavane') {
            return await this.actor.rollKa(id);
        }
    }

    async _onSimulacreRoll(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const type = li.data("item-type");
        return await this.actor.rollSimulacre(id, false, type);
    }

    async _onSimulacreOfRoll(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = this.actor.data.data.simulacre.refid;
        const type = li.data("item-type");
        return await this.actor.rollSimulacre(id, false, type);
    }

    async _onItemRoll(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = CustomHandlebarsHelpers.getItem(id);
        return await item.roll(this.actor);
    }

    async _onEditItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = CustomHandlebarsHelpers.getItem(id);
        item.sheet.render(true);
    }

    async _onRoll(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = this.actor.items.get(id);
        const skillName = item.data.data.skill;
        const uuid = this.getCombatSkillsUUID(skillName);
        const skill = CustomHandlebarsHelpers.getItem(uuid);
        return await skill.roll(this.actor);
    }

    getCombatSkillsUUID(skill) {
        switch(skill) {
            case 'melee':
                return game.settings.get('neph5e', 'uuidMelee');
            case 'esquive':
                return game.settings.get('neph5e', 'uuidDodge');
            case 'martial':
                return game.settings.get('neph5e', 'uuidHand');
            case 'trait':
                return game.settings.get('neph5e', 'uuidDraft');
            case 'feu':
                return game.settings.get('neph5e', 'uuidFire');
            case 'lourde':
                return game.settings.get('neph5e', 'uuidHeavy');
        }
    }

    /**
     * This method is used to lock/unlock the current periode.
     */
    async _onEditIncarnations(event) {
        event.preventDefault();
        let li = $(event.currentTarget).parents(".item");
        if (li != undefined) {
            const id = li.data("item-id");
            if (id === undefined) {
                li = $(event.currentTarget).parents(".item-list-header");
                const id = li.data("item-id");
                const type = li.data("item-type");
                const item = CustomHandlebarsHelpers.getItem(id);
                if (type == "periode") {

                    const i = $(event.currentTarget).children();

                    // No unlocked periode: unlock the current
                    if (this.current === null) {
                        this.current = item;
                        this.current_i = i;
                        i.removeClass("fa-lock");
                        i.addClass("fa-unlock");

                        // The periode must be locked
                    } else {
                        const old_pid = this.current.data.data.id;
                        const pid = item.data.data.id;
                        if (old_pid === pid) {
                            this.current = null;
                            this.current_i = null;
                            i.removeClass("fa-unlock");
                            i.addClass("fa-lock");
                        }
                    }
                }
            } else {
                const type = li.data("item-type");
                switch (type) {
                    case 'vecu':
                    case 'savoir':
                    case 'quete':
                    case 'arcane':
                    case 'chute':
                    case 'passe':
                        await this._onEditItem(event);
                        break;
                }
            }
        }
    }

    async _onShowSomething(event, createProperties) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        if (li.hasClass("expanded")) {
            let summary = li.next(".item-summary");
            summary.slideUp(200, () => summary.remove());
        } else {
            const item = CustomHandlebarsHelpers.getItem(id);
            const summary = $(`<li class="item-summary"/>`);
            const properties = createProperties(item);
            summary.append(properties);
            li.after(summary.hide());
            summary.slideDown(200);
        }
        li.toggleClass("expanded");
    }

    async _onShowSort(event) {
        await this._onShowSomething(event, (item) => {
            const properties = $(`<ol/>`);
            properties.append(this._property(game.i18n.localize('NEPH5E.' + item.data.data.element), 'NEPH5E.element'));
            properties.append(this._property(item.data.data.degre, 'NEPH5E.degre'));
            properties.append(this._property(item.difficulty(this.actor) + '0%', 'NEPH5E.difficulte'));
            properties.append(this._property(item.data.data.duree, 'NEPH5E.duree'));
            properties.append(this._property(item.data.data.portee, 'NEPH5E.portee'));
            properties.append(this._property(item.data.data.description));
            return properties;
        });
    }

    async _onShowInvocation(event) {
        await this._onShowSomething(event, (item) => {
            if (item.data.type === 'ordonnance') {
                const properties = $(`<ol/>`);
                properties.append(this._property(game.i18n.localize('NEPH5E.' + item.data.data.element), 'NEPH5E.element'));
                properties.append(this._property(game.i18n.localize('NEPH5E.kabbale.mondes.' + item.data.data.monde), 'NEPH5E.kabbale.monde'));
                properties.append(this._property(item.data.data.degre, 'NEPH5E.degre'));
                properties.append(this._property(item.difficulty(this.actor) + '0%', 'NEPH5E.difficulte'));
                properties.append(this._property(item.data.data.duree, 'NEPH5E.duree'));
                properties.append(this._property(item.data.data.portee, 'NEPH5E.portee'));
                properties.append(this._property(item.data.data.description));
                return properties;
            }
        });
    }

    async _onShowFormule(event) {
        await this._onShowSomething(event, (item) => {
            const properties = $(`<ol/>`);
            properties.append(this._property(item.data.data.enonce, 'NEPH5E.alchimie.enonce'));
            properties.append(this._property(game.i18n.localize('NEPH5E.' + item.data.data.elements[0]), 'NEPH5E.element'));
            if (item.data.data.cercle === 'oeuvreAuBlanc') {
                properties.append(this._property(game.i18n.localize('NEPH5E.' + item.data.data.elements[1]), 'NEPH5E.element'));
            }
            properties.append(this._property(game.i18n.localize('NEPH5E.alchimie.substances.' + item.data.data.substance), 'NEPH5E.alchimie.substance'));
            properties.append(this._property(item.data.data.degre, 'NEPH5E.degre'));
            properties.append(this._property(item.difficulty(this.actor) + '0%', 'NEPH5E.difficulte'));
            properties.append(this._property(item.data.data.duree, 'NEPH5E.duree'));
            properties.append(this._property(item.data.data.aire, 'NEPH5E.aire'));
            properties.append(this._property(item.data.data.description));
            return properties;
        });
    }

    async _onShowAspect(event) {
        await this._onShowSomething(event, (item) => {
            const properties = $(`<ol/>`);
            properties.append(this._property(item.data.data.degre, 'NEPH5E.construction'));
            properties.append(this._property(item.data.data.activation, 'NEPH5E.cout'));
            properties.append(this._property(item.data.data.duree, 'NEPH5E.duree'));
            properties.append(this._property(item.data.data.description));
            return properties;
        });
    }

    async _onShowRite(event) {
        await this._onShowSomething(event, (item) => {
            const properties = $(`<ol/>`);
            properties.append(this._property(game.i18n.localize('NEPH5E.necromancie.desmos.' + item.data.data.desmos), 'NEPH5E.necromancie.desmos.nom'));
            properties.append(this._property(item.difficulty(this.actor) + '0%', 'NEPH5E.difficulte'));
            properties.append(this._property(item.data.data.degre, 'NEPH5E.cout'));
            properties.append(this._property(item.data.data.duree, 'NEPH5E.duree'));
            properties.append(this._property(item.data.data.description));
            return properties;
        });
    }

    async _onShowAppel(event) {
        await this._onShowSomething(event, (item) => {
            const properties = $(`<ol/>`);
            properties.append(this._property(game.i18n.localize('NEPH5E.conjuration.appels.' + item.data.data.appel), 'NEPH5E.conjuration.appel'));
            properties.append(this._property(item.difficulty(this.actor) + '0%', 'NEPH5E.difficulte'));
            properties.append(this._property(item.data.data.degre, 'NEPH5E.degre'));
            properties.append(this._property((item.data.data.controle ? "Oui" : "Non"), 'NEPH5E.controle'));
            properties.append(this._property(item.data.data.visibilite, 'NEPH5E.visibilite'));
            properties.append(this._property(item.data.data.entropie, 'NEPH5E.entropie'));
            properties.append(this._property(item.data.data.dommages, 'NEPH5E.dommages'));
            properties.append(this._property(item.data.data.protection, 'NEPH5E.protection'));
            properties.append(this._property(item.data.data.description));
            return properties;
        });
    }

    async _onShowTechnique(event) {
        await this._onShowSomething(event, (item) => {
            const properties = $(`<ol/>`);
            properties.append(this._property(item.difficulty(this.actor) + '0%', 'NEPH5E.difficulte'));
            properties.append(this._property(item.data.data.degre, 'NEPH5E.degre'));
            properties.append(this._property(item.data.data.description));
            return properties;
        });
    }

    async _onShowTekhne(event) {
        await this._onShowSomething(event, (item) => {
            const properties = $(`<ol/>`);
            properties.append(this._property(item.difficulty(this.actor) + '0%', 'NEPH5E.difficulte'));
            properties.append(this._property(item.data.data.degre, 'NEPH5E.degre'));
            properties.append(this._property(item.data.data.description));
            return properties;
        });
    }

    async _onShowRituel(event) {
        await this._onShowSomething(event, (item) => {
            const properties = $(`<ol/>`);
            properties.append(this._property(item.difficulty(this.actor) + '0%', 'NEPH5E.difficulte'));
            properties.append(this._property(item.data.data.degre, 'NEPH5E.degre'));
            properties.append(this._property(item.data.data.description));
            return properties;
        });
    }

    async _onShowPratique(event) {
        await this._onShowSomething(event, (item) => {
            const properties = $(`<ol/>`);
            properties.append(this._property(game.i18n.localize('NEPH5E.denier.' + item.data.data.axe), 'NEPH5E.denier.axe'));
            properties.append(this._property(item.difficulty(this.actor) + '0%', 'NEPH5E.difficulte'));
            properties.append(this._property(item.data.data.degre, 'NEPH5E.degre'));
            properties.append(this._property(item.data.data.description));
            return properties;
        });
    }

    _property(value, name = null) {
        const property = $(`<li class="item-property">`);
        if (name) {
            property.append($(`<span class="item-property-name">` + game.i18n.localize(name) + `</span>`));
        }
        property.append($(`<span class="item-property-value">` + value + `</span>`));
        return property;
    }

    getItem(id) {
        return game.items.find(function (item) { return item.data.data.id === id });
    }

}