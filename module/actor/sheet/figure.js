import { droppedItem } from "../../common/tools.js";
import { CustomHandlebarsHelpers } from "../../common/handlebars.js";
import { getByPath } from "../../common/tools.js";
import { UUID } from "../../common/tools.js";
import { Game } from "../../common/game.js";
import { Rolls } from "../../common/rolls.js";
import { deleteItemOf } from "../../common/tools.js";
import { droppedActor } from "../../common/tools.js";
import { BaseSheet } from "./base.js";
import { AppelSheet } from "../../item/sheet/appel.js";
import { AspectSheet } from "../../item/sheet/aspect.js";
import { CompetenceSheet } from "../../item/sheet/competence.js";
import { FormuleSheet } from "../../item/sheet/formule.js";
import { InvocationSheet } from "../../item/sheet/invocation.js";
import { QueteSheet } from "../../item/sheet/quete.js";
import { RiteSheet } from "../../item/sheet/rite.js";
import { SavoirSheet } from "../../item/sheet/savoir.js";
import { SortSheet } from "../../item/sheet/sort.js";

export class FigureSheet extends BaseSheet {

    /**
     * @constructor
     * @param  {...any} args
     */
    constructor(...args) {
        super(...args);
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
            width: 1000,
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
            currentPeriode: this.getCurrentPeriodeId(),
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
        html.find('div[data-tab="combat"] .edit-arme').click(this._onEditEmbeddedItem.bind(this));
        html.find('div[data-tab="combat"] .edit-armure').click(this._onEditEmbeddedItem.bind(this));
        html.find('div[data-tab="combat"] .item-delete').click(this._onDeleteEmbeddedItem.bind(this));
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
        html.find('div[data-tab="simulacre"] .roll-attribute').click(this._onRollSimulacreAttribute.bind(this));
        html.find('div[data-tab="simulacre"] .roll-vecu').click(this._onRollVecuSimulacre.bind(this));

        // Nephilim
        html.find('div[data-tab="nephilim"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="nephilim"] .item-roll').click(this._onNephilimRoll.bind(this));
        html.find('div[data-tab="nephilim"] .roll-ka').click(this._onRollPentacle.bind(this));
        html.find('div[data-tab="nephilim"] .show-arcane').click(this._onEditItem.bind(this));
        html.find('div[data-tab="nephilim"] .show-chute').click(this._onEditItem.bind(this));

        // Vecus
        html.find('div[data-tab="vecus"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="vecus"] .edit-competence').click(this._onEditCompetence.bind(this));
        html.find('div[data-tab="vecus"] .edit-savoir').click(this._onEditSavoir.bind(this));
        html.find('div[data-tab="vecus"] .edit-quete').click(this._onEditQuete.bind(this));
        html.find('div[data-tab="vecus"] .edit-passe').click(this._onEditPasse.bind(this));
        html.find('div[data-tab="vecus"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="vecus"] .roll-vecu-simulacre').click(this._onRollVecuSimulacre.bind(this));
        html.find('div[data-tab="vecus"] .item-roll-vecu').click(this._onRollVecu.bind(this));
        html.find('div[data-tab="vecus"] .edit-vecu').click(this._onEditEmbeddedItem.bind(this));
        html.find('div[data-tab="vecus"] .edit-vecu-simulacre').click(this._onEditVecuSimulacre.bind(this));

        // Magie
        html.find('div[data-tab="magie"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="magie"] .edit-sort').click(this._onEditSort.bind(this));
        html.find('div[data-tab="magie"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="magie"] .item-delete').click(this._onDeleteItem.bind(this));

        // Kabbale
        html.find('div[data-tab="kabbale"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="kabbale"] .edit-invocation').click(this._onEditInvocation.bind(this));
        html.find('div[data-tab="kabbale"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="kabbale"] .item-delete').click(this._onDeleteItem.bind(this));

        // Alchimie
        html.find('div[data-tab="alchimie"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="alchimie"] .item-name').click(this._onEditFormule.bind(this));
        html.find('div[data-tab="alchimie"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="alchimie"] .item-delete').click(this._onDeleteItem.bind(this));

        // Laboratoire
        html.find('div[data-tab="laboratoire"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="laboratoire"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="laboratoire"] .item-delete').click(this._onDeleteItem.bind(this));

        // Incarnations
        html.find('div[data-tab="incarnations"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="incarnations"] .lock-periode').click(this._onLockPeriode.bind(this));
        html.find('div[data-tab="incarnations"] .item-edit').click(this._onEditIncarnations.bind(this));
        html.find('div[data-tab="incarnations"] .delete-periode').click(this._onDeletePeriode.bind(this));
        html.find('div[data-tab="incarnations"] .item-delete').click(this._onDeleteIncarnations.bind(this));
        html.find('div[data-tab="incarnations"] .edit-vecu').click(this._onEditEmbeddedItem.bind(this));
        html.find('div[data-tab="incarnations"] .delete-vecu').click(this._onDeleteVecu.bind(this));
        html.find('div[data-tab="incarnations"] .degre-vecu').change(this._onDegreVecu.bind(this));
        html.find('div[data-tab="incarnations"] .periode-active').change(this._onPeriodeActive.bind(this));
        html.find('div[data-tab="incarnations"] .move-up').click(this._onMoveUp.bind(this));
        html.find('div[data-tab="incarnations"] .move-down').click(this._onMoveDown.bind(this));

        // Selenim
        html.find('div[data-tab="selenim"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="selenim"] .edit-aspect').click(this._onEditAspect.bind(this));
        html.find('div[data-tab="selenim"] .roll-ka').click(this._onRollNoyau.bind(this));
        html.find('div[data-tab="selenim"] .item-roll').click(this._onSelenimRoll.bind(this));
        html.find('div[data-tab="selenim"] .item-delete').click(this._onDeleteItem.bind(this));

        // Conjuration
        html.find('div[data-tab="conjuration"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="conjuration"] .edit-appel').click(this._onEditAppel.bind(this));
        html.find('div[data-tab="conjuration"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="conjuration"] .item-delete').click(this._onDeleteItem.bind(this));

        // Necromancie
        html.find('div[data-tab="necromancie"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="necromancie"] .edit-rite').click(this._onEditRite.bind(this));
        html.find('div[data-tab="necromancie"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="necromancie"] .item-delete').click(this._onDeleteItem.bind(this));

        // Baton
        html.find('div[data-tab="baton"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="baton"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="baton"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="baton"] .item-delete').click(this._onDeleteItem.bind(this));

        // Coupe
        html.find('div[data-tab="coupe"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="coupe"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="coupe"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="coupe"] .item-delete').click(this._onDeleteItem.bind(this));

        // Denier
        html.find('div[data-tab="denier"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="denier"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="denier"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="denier"] .item-delete').click(this._onDeleteItem.bind(this));

        // Epee
        html.find('div[data-tab="epee"]').on("drop", this._onDrop.bind(this));
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
            
            // The vecu has been droppped
            } else if (item.data.type === "vecu") {
                if (event.currentTarget.getElementsByClassName('tab incarnations active').length === 1 && this.currentPeriodeExist()) {
                    const items = await super._onDrop(event);
                    await items[0].update({ ['data.periode']: this.getCurrentPeriodeId() });
                }

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
                        savoirs: [],
                        quetes: [],
                        arcanes: [],
                        chutes: [],
                        passes: [],
                        sciences: []
                    };
                    periodes.unshift(periode);
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
        if (this.currentPeriodeExist()) {
            const periodes = duplicate(this.actor.data.data.periodes);
            const index = periodes.findIndex(p => (p.refid === this.getCurrentPeriodeId()));
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
                const savoirs = this._updatePeriode(p, 'savoirs', formData, ['degre']);
                const quetes = this._updatePeriode(p, 'quetes', formData, ['degre']);
                const arcanes = this._updatePeriode(p, 'arcanes', formData, ['degre']);
                const chutes = this._updatePeriode(p, 'chutes', formData, ['degre']);
                const passes = this._updatePeriode(p, 'passes', formData, ['degre']);
                const sciences = this._updatePeriode(p, 'sciences', formData, ['ref', 'degre']);

                periodes.push({
                    refid: formData[periodeName + ".refid"],
                    active: formData[periodeName + ".active"],
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

    async _onDegreVecu(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const degre = parseInt(event.currentTarget.value);
        const item = this.actor.items.get(id);
        await item.update({"data.degre": degre});
    }

    async _onPeriodeActive(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const actif = event.currentTarget.checked;
        for (let item of this.actor.items.filter(i => i.type === 'vecu' && i.data.data.periode === id)) {
            await item.update({ ['data.actif']: actif });
        }
    }

    async _onMoveUp(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const periodes = this.actor.data.data.periodes;
        const i = periodes.findIndex(p => p.refid === id);
        const pi = periodes[i];
        const pii = periodes[i-1];
        periodes[i] = pii;
        periodes[i-1] = pi;
        await this.actor.update({ ['data.periodes']: periodes });
    }

    async _onMoveDown(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const periodes = this.actor.data.data.periodes;
        const i = periodes.findIndex(p => p.refid === id);
        const pi = periodes[i];
        const pii = periodes[i+1];
        periodes[i] = pii;
        periodes[i+1] = pi;
        await this.actor.update({ ['data.periodes']: periodes });
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

    async _onDeleteEmbeddedItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        return await this.actor.deleteEmbeddedDocuments('Item', [li.data("item-id")]);
    }

    async _onDeleteVecu(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const periode = CustomHandlebarsHelpers.getItem(li.data("periode-id"));
        if (this.isCurrentPeriode(periode)) {
            return await this.actor.deleteEmbeddedDocuments('Item', [li.data("item-id")]);
        }
    }

    async _onEditEmbeddedItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = this.actor.getEmbeddedDocument('Item', id);
        item.sheet.render(true);
    }

    async _onDeletePeriode(event) {
        event.preventDefault();
        let li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const type = li.data("item-type");
        if (this.getCurrentPeriodeId() === id) {
            const periode = CustomHandlebarsHelpers.getItem(id);
            await this.actor.deletePeriode(periode);
            if (periode.data.data.id === this.getCurrentPeriodeId()) {
                await this.unsetCurrentPeriode();
            }
        }
    }

    async _onDeleteIncarnations(event) {
        event.preventDefault();
        let li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
            // Delete item in periode except vecus which are embbeded
            const periode = CustomHandlebarsHelpers.getItem(li.data("periode-id"));
            if (this.isCurrentPeriode(periode)) {
                const type = li.data("item-type");
                switch (type) {

                    case 'arcane':
                        await this.actor.deleteArcane(CustomHandlebarsHelpers.getItem(id), periode);
                        break;

                    case 'chute':
                        await this.actor.deleteChute(CustomHandlebarsHelpers.getItem(id), periode);
                        break;
                    
                    case 'passe':
                        await this.actor.deletePasse(CustomHandlebarsHelpers.getItem(id), periode);
                        break;

                    case 'quete':
                        await this.actor.deleteQuete(CustomHandlebarsHelpers.getItem(id), periode);
                        break;

                    case 'savoir':
                        await this.actor.deleteSavoir(CustomHandlebarsHelpers.getItem(id), periode);
                        break;

                    case 'science':
                        await this.actor.deleteScience(CustomHandlebarsHelpers.getItem(id), periode);
                        break;

                }
            }
    }

    async _onRollPentacle(event) {
        const elt = $(event.currentTarget).closest(".roll-ka").data("element");
        return await this.actor.rollKa(elt);
    }

    async _onRollNoyau(event) {
        const elt = $(event.currentTarget).closest(".roll-ka").data("element");
        return await this.actor.rollKa(elt);
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
        const vecuId = li.data("vecu-id");
        return await this.actor.rollSimulacre(id, true, (type === 'vecu' ? vecuId : type));
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

    // -------------------------------------> Item edition

    async _onEditCompetence(event) {
        await CompetenceSheet.onEdit(event, this.actor);
    }

    async _onEditSavoir(event) {
        await SavoirSheet.onEdit(event, this.actor);
    }

    async _onEditQuete(event) {
        await QueteSheet.onEdit(event, this.actor);
    }

    async _onEditRite(event) {
        await RiteSheet.onEdit(event, this.actor);
    }

    async _onEditSort(event) {
        await SortSheet.onEdit(event, this.actor);
    }

    async _onEditInvocation(event) {
        await InvocationSheet.onEdit(event, this.actor);
    }

    async _onEditFormule(event) {
        await FormuleSheet.onEdit(event, this.actor);
    }

    async _onEditAppel(event) {
        await AppelSheet.onEdit(event, this.actor);
    }

    async _onEditAspect(event) {
        await AspectSheet.onEdit(event);
    }

    async _onEditPasse(event) {
        await this._onEditItem(event);
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

    async _onRollVecu(event) {
        const li = $(event.currentTarget).parents(".item");
        const actor = this.actor;
        const item = actor.items.get(li.data("item-id"));
        return Rolls.check(
            actor,
            item,
            item.type,
            {
                ...item.data,
                owner: actor.id,
                difficulty: item.data.data.degre,
                sentence: "fait appel à son vécu de " + item.name
            }
        );
    }

    async _onRollVecuSimulacre(event) {
        const li = $(event.currentTarget).parents(".item");
        const actor = CustomHandlebarsHelpers.getActor(this.actor.data.data.simulacre.refid)
        const item = actor.items.get(li.data("item-id"));
        return Rolls.check(
            this.actor,
            item,
            item.type,
            {
                ...item.data,
                owner: this.actor.id,
                difficulty: item.data.data.degre,
                sentence: "fait appel au vécu de " + item.name + " de son simulacre"
            }
        );
    }

    async _onRollSimulacreAttribute(event) {
        const actor = CustomHandlebarsHelpers.getActor(this.actor.data.data.simulacre.refid);
        const attribute = $(event.currentTarget).data("attribute");
        let sentence = "";
        switch (attribute) {
            case 'soleil':
                sentence = "fait appel au Ka Soleil de son simulacre";
                break;
            case 'agile':
                sentence = "fait appel à l'agilité de son simulacre";
                break;
            case 'endurant':
                sentence = "fait appel à l'endurance de son simulacre";
                break;
            case 'fort':
                sentence = "fait appel à la force de son simulacre";
                break;
            case 'intelligent':
                sentence = "fait appel à l'intelligence de son simulacre";
                break;
            case 'seduisant':
                sentence = "fait appel à au charisme de son simulacre";
                break;
            case 'savant':
                sentence = "fait appel à la culture de son simulacre";
                break;
            case 'sociable':
                sentence = "fait appel à la sociabilité de son simulacre";
                break;
            case 'fortune':
                sentence = "fait appel à la fortune de son simulacre";
                break;
        }
        return Rolls.check(
            actor,
            { img: 'systems/neph5e/icons/caracteristique.jpg' },
            "soleil",
            {
                ...actor.data,
                owner: actor.id,
                difficulty: actor.data.data[attribute],
                sentence: sentence
            }
        );
    }

    async _onEditVecuSimulacre(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const actor = CustomHandlebarsHelpers.getActor(this.actor.data.data.simulacre.refid)
        const item = actor.items.get(li.data("item-id"));
        item.sheet.render(true);
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

    async _onLockPeriode(event) {
        event.preventDefault();
        let li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = CustomHandlebarsHelpers.getItem(id);
        const i = $(event.currentTarget).children();

        // No current periode. The selected periode becomes the current one.
        if (!this.currentPeriodeExist()) {
            await this.setCurrentPeriode(item);

        // A periode is selected
        } else {
            const old_pid = this.getCurrentPeriodeId();
            const pid = item.data.data.id;

            // The current periode is the selected one. Unselect the periode.
            if (old_pid === pid) {
                await this.unsetCurrentPeriode();

            // The current periode is not the selected one. Unselect the current which becomes the selected one.
            } else {
                await this.setCurrentPeriode(item);
            }
        }
        this.actor.sheet.render(true);
    }

    /**
     * This method is used to lock/unlock the current periode.
     */
    async _onEditIncarnations(event) {
        event.preventDefault();
        await this._onEditItem(event);
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

    currentPeriodeExist() {
        return this.actor.getFlag("world", "currentPeriode") !== undefined;
    }

    isCurrentPeriode(item) {
        return this.actor.getFlag("world", "currentPeriode") === item.data.data.id;
    }

    getCurrentPeriodeId() {
        return this.actor.getFlag("world", "currentPeriode");
    }

    async setCurrentPeriode(item) {
        await this.actor.setFlag("world", "currentPeriode", item.data.data.id);
    }

    async unsetCurrentPeriode() {
        await this.actor.unsetFlag("world", "currentPeriode");
    }

}