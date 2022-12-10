import { AbstractRollBuilder } from "../../feature/core/abstractRollBuilder.js";
import { BaseSheet } from "./base.js";
import { Chute } from "../../feature/periode/chute.js";
import { Constants } from "../common/constants.js";
import { CustomHandlebarsHelpers } from "../common/handlebars.js";
import { EmbeddedItem } from "../common/embeddedItem.js";
import { Game } from "../common/game.js";
import { NephilimItemSheet } from "../item/base.js";
import { Periode } from "../../feature/periode/periode.js";

export class FigureSheet extends BaseSheet {

    /**
     * @constructor
     * @param args
     */
    constructor(...args) {
        super(...args);
        this.editedCapacity = null;
        this.editedPeriode = null;
        this.elapsedPeriodes = this._initialElapsedPeriodes();
    }

    /**
     * @return the path of the specified actor sheet.
     */
    get template() {
        return 'systems/neph5e/templates/actor/figure.html';
    }

    /**
     * @return the elapsed periodes according to the user option and the history.
     */
    _initialElapsedPeriodes() {
        if (this.actor.system.options.incarnationsOuvertes == true) {
            return Periode.getOriginals(this.actor)
        } else {
            return [];
        }
    }

    /**
     * @override
     */
     _updateObject(event, formData) {
        if (formData['system.id'] == null || formData['system.id'] === "") {
            formData['system.id'] = CustomHandlebarsHelpers.UUID();
        }
        super._updateObject(event, formData);
    }

    /**
     * @override
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 1000,
            height: 850,
            classes: ["nephilim", "sheet", "actor"],
            resizable: true,
            scrollY: [
                ".tab.description",
                ".tab.vecus",
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
                    initial: "description"
                }]
        });
    }

    getData() {
        const baseData = super.getData();
        const simulacre = this.actor.simulacre;
        let sheetData = {
            owner: this.actor.isOwner,
            editable: this.isEditable,
            isGM: game.user.isGM,
            actor: baseData.actor,
            system: baseData.actor.system,
            cercles: Game.alchimie.cercles,
            catalyseurs: game.settings.get('neph5e', 'catalyseurs'),
            sciencesOccultes: game.settings.get('neph5e', 'sciencesOccultes'),
            useCombatSystem: game.settings.get('neph5e', 'useCombatSystem'),
            editedPeriode: this.editedPeriode,
            elapsedPeriodes: this.elapsedPeriodes,
            editedCapacity: this.editedCapacity,
            simulacre: {
                name: simulacre?.name,
                img: simulacre?.img
            }
        }
        return sheetData;
    }

    /**
     * @override
     */
    activateListeners(html) {

        super.activateListeners(html);

        // Alchimie
        html.find('div[data-tab="alchimie"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="alchimie"] .edit-focus').click(this._onEditFeature.bind(this, 'focus'));
        html.find('div[data-tab="alchimie"] .change-status').click(this._onChangeStatus.bind(this));
        html.find('div[data-tab="alchimie"] .change-focus').click(this._onChangeFocus.bind(this));
        html.find('div[data-tab="alchimie"] .change-quantite').change(this._onChangeQuantite.bind(this));
        html.find('div[data-tab="alchimie"] .change-transporte').change(this._onChangeTransporte.bind(this));
        html.find('div[data-tab="alchimie"] .roll-focus').click(this._onRollFeature.bind(this, 'focus'));
        html.find('div[data-tab="alchimie"] .roll-science').click(this._onRollFeature.bind(this, 'science'));
        html.find('div[data-tab="alchimie"] .item-delete').click(this._onDeleteEmbeddedItem.bind(this));

        // Combat
        html.find('div[data-tab="combat"] .edit-esquive').click(this._onEditEsquive.bind(this));
        html.find('div[data-tab="combat"] .edit-lutte').click(this._onEditLutte.bind(this));

        // Conjuration
        html.find('div[data-tab="conjuration"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="conjuration"] .edit-focus').click(this._onEditFeature.bind(this, 'focus'));
        html.find('div[data-tab="conjuration"] .change-status').click(this._onChangeStatus.bind(this));
        html.find('div[data-tab="conjuration"] .change-focus').click(this._onChangeFocus.bind(this));
        html.find('div[data-tab="conjuration"] .roll-focus').click(this._onRollFeature.bind(this, 'focus'));
        html.find('div[data-tab="conjuration"] .roll-science').click(this._onRollFeature.bind(this, 'science'));
        html.find('div[data-tab="conjuration"] .item-delete').click(this._onDeleteEmbeddedItem.bind(this));

        // Incarnations
        html.find('div[data-tab="incarnations"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="incarnations"] .delete-periode').click(this._onDeletePeriode.bind(this));
        html.find('div[data-tab="incarnations"] .current-periode').click(this._onCurrentPeriode.bind(this));
        html.find('div[data-tab="incarnations"] .delete-item').click(this._onDeleteEmbeddedItem.bind(this));
        html.find('div[data-tab="incarnations"] .edit-periode').click(this._onEditPeriode.bind(this));
        html.find('div[data-tab="incarnations"] .edit-vecu').click(this._onEditEmbeddedItem.bind(this));
        html.find('div[data-tab="incarnations"] .edit-item').click(this._onEditFeature.bind(this, 'item'));
        html.find('div[data-tab="incarnations"] .change-degre').change(this._onChangeDegre.bind(this));
        html.find('div[data-tab="incarnations"] .active-periode').click(this._onToggleActivePeriode.bind(this));
        html.find('div[data-tab="incarnations"] .display').click(this._onDisplayPeriode.bind(this));

        // Kabbale
        html.find('div[data-tab="kabbale"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="kabbale"] .edit-focus').click(this._onEditFeature.bind(this, 'focus'));
        html.find('div[data-tab="kabbale"] .edit-ordonnance').click(this._onEditFeature.bind(this, 'ordonnance'));
        html.find('div[data-tab="kabbale"] .change-status').click(this._onChangeStatus.bind(this));
        html.find('div[data-tab="kabbale"] .change-focus').click(this._onChangeFocus.bind(this));
        html.find('div[data-tab="kabbale"] .change-pacte').click(this._onChangePacte.bind(this));
        html.find('div[data-tab="kabbale"] .roll-focus').click(this._onRollFeature.bind(this, 'focus'));
        html.find('div[data-tab="kabbale"] .roll-science').click(this._onRollFeature.bind(this, 'science'));
        html.find('div[data-tab="kabbale"] .item-delete').click(this._onDeleteEmbeddedItem.bind(this));

        // Laboratoire
        html.find('div[data-tab="laboratoire"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="laboratoire"] .change-quantite').change(this._onChangeQuantite.bind(this));
        html.find('div[data-tab="laboratoire"] .edit-catalyseur').click(this._onEditFeature.bind(this, 'catalyseur'));
        html.find('div[data-tab="laboratoire"] .edit-materiae').click(this._onEditFeature.bind(this, 'materiae'));
        html.find('div[data-tab="laboratoire"] .item-delete').click(this._onDeleteEmbeddedItem.bind(this));

        // Magie
        html.find('div[data-tab="magie"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="magie"] .edit-focus').click(this._onEditFeature.bind(this, 'focus'));
        html.find('div[data-tab="magie"] .change-status').click(this._onChangeStatus.bind(this));
        html.find('div[data-tab="magie"] .change-focus').click(this._onChangeFocus.bind(this));
        html.find('div[data-tab="magie"] .roll-focus').click(this._onRollFeature.bind(this, 'focus'));
        html.find('div[data-tab="magie"] .roll-science').click(this._onRollFeature.bind(this, 'science'));
        html.find('div[data-tab="magie"] .item-delete').click(this._onDeleteEmbeddedItem.bind(this));

        // Necromancie
        html.find('div[data-tab="necromancie"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="necromancie"] .edit-focus').click(this._onEditFeature.bind(this, 'focus'));
        html.find('div[data-tab="necromancie"] .change-status').click(this._onChangeStatus.bind(this));
        html.find('div[data-tab="necromancie"] .change-focus').click(this._onChangeFocus.bind(this));
        html.find('div[data-tab="necromancie"] .roll-focus').click(this._onRollFeature.bind(this, 'focus'));
        html.find('div[data-tab="necromancie"] .roll-science').click(this._onRollFeature.bind(this, 'science'));
        html.find('div[data-tab="necromancie"] .item-delete').click(this._onDeleteEmbeddedItem.bind(this));

        // Nephilim
        html.find('div[data-tab="nephilim"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="nephilim"] .formed').click(this._onToggleFormed.bind(this));
        html.find('div[data-tab="nephilim"] .visible').click(this._onToggleVisible.bind(this));
        html.find('div[data-tab="nephilim"] .edit-metamorphe').click(this._onEditFeature.bind(this, 'metamorphe'));
        html.find('div[data-tab="nephilim"] .edit-arcane').click(this._onEditFeature.bind(this, 'arcane'));
        html.find('div[data-tab="nephilim"] .roll-arcane').click(this._onRollFeature.bind(this, 'arcane'));
        html.find('div[data-tab="nephilim"] .roll-ka').click(this._onRollFeature.bind(this, 'ka'));
        html.find('div[data-tab="nephilim"] .khaiba').click(this._onKhaiba.bind(this));
        html.find('div[data-tab="nephilim"] .narcose').click(this._onNarcose.bind(this));
        html.find('div[data-tab="nephilim"] .ombre').click(this._onOmbre.bind(this));
        html.find('div[data-tab="nephilim"] .luneNoire').click(this._onLuneNoire.bind(this));

        // Selenim
        html.find('div[data-tab="selenim"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="selenim"] .edit-aspect').click(this._onEditFeature.bind(this, 'aspect'));
        html.find('div[data-tab="selenim"] .roll-pavane').click(this._onRollFeature.bind(this, 'pavane'));
        html.find('div[data-tab="selenim"] .roll-noyau').click(this._onRollFeature.bind(this, 'noyau'));
        html.find('div[data-tab="selenim"] .item-delete').click(this._onDeleteEmbeddedItem.bind(this));
        html.find('div[data-tab="selenim"] .active').click(this._onToggleActive.bind(this));

        // Simulacre
        html.find('div[data-tab="simulacre"]').click(this._onOpenSimulacre.bind(this));
        html.find('div[data-tab="simulacre"]').on("drop", this._onDrop.bind(this));

        // Vecus
        html.find('div[data-tab="vecus"] .edit-competence').click(this._onEditFeature.bind(this, 'competence'));
        html.find('div[data-tab="vecus"] .edit-passe').click(this._onEditFeature.bind(this, 'passe'));
        html.find('div[data-tab="vecus"] .edit-quete').click(this._onEditFeature.bind(this, 'quete'));
        html.find('div[data-tab="vecus"] .edit-savoir').click(this._onEditFeature.bind(this, 'savoir'));
        html.find('div[data-tab="vecus"] .edit-vecu').click(this._onEditEmbeddedItem.bind(this));
        html.find('div[data-tab="vecus"] .edit-chute').click(this._onEditFeature.bind(this, 'chute'));
        html.find('div[data-tab="vecus"] .roll-competence').click(this._onRollFeature.bind(this, 'competence'));
        html.find('div[data-tab="vecus"] .roll-passe').click(this._onRollFeature.bind(this, 'passe'));
        html.find('div[data-tab="vecus"] .roll-quete').click(this._onRollFeature.bind(this, 'quete'));
        html.find('div[data-tab="vecus"] .roll-savoir').click(this._onRollFeature.bind(this, 'savoir'));
        html.find('div[data-tab="vecus"] .roll-vecu').click(this._onRollFeature.bind(this, 'vecu'));
        html.find('div[data-tab="vecus"] .roll-chute').click(this._onRollFeature.bind(this, 'chute'));

        // Options
        html.find('div[data-tab="options"] .incarnationsOuvertes').change(this._onChangePeriodesDisplay.bind(this));

        html.find('div[data-tab="vecus"] .macro').each((i, li) => {
            li.setAttribute("draggable", true);
            li.addEventListener("dragstart", event => this.addMacroData(event), false);
        });

        html.find('div[data-tab="nephilim"] .macro').each((i, li) => {
            li.setAttribute("draggable", true);
            li.addEventListener("dragstart", event => this.addMacroData(event), false);
        });

        html.find('div[data-tab="selenim"] .macro').each((i, li) => {
            li.setAttribute("draggable", true);
            li.addEventListener("dragstart", event => this.addMacroData(event), false);
        });

        html.find('div[data-tab="alchimie"] .macro').each((i, li) => {
            li.setAttribute("draggable", true);
            li.addEventListener("dragstart", event => this.addMacroData(event), false);
        });

        html.find('div[data-tab="kabbale"] .macro').each((i, li) => {
            li.setAttribute("draggable", true);
            li.addEventListener("dragstart", event => this.addMacroData(event), false);
        });

        html.find('div[data-tab="magie"] .macro').each((i, li) => {
            li.setAttribute("draggable", true);
            li.addEventListener("dragstart", event => this.addMacroData(event), false);
        });

        html.find('div[data-tab="necromancie"] .macro').each((i, li) => {
            li.setAttribute("draggable", true);
            li.addEventListener("dragstart", event => this.addMacroData(event), false);
        });

        html.find('div[data-tab="conjuration"] .macro').each((i, li) => {
            li.setAttribute("draggable", true);
            li.addEventListener("dragstart", event => this.addMacroData(event), false);
        });

////////////

        // Baton
        //html.find('div[data-tab="baton"]').on("drop", this._onDrop.bind(this));
        //html.find('div[data-tab="baton"] .item-edit').click(this._onEditItem.bind(this));
        //html.find('div[data-tab="baton"] .item-delete').click(this._onDeleteItem.bind(this));

        // Coupe
        //html.find('div[data-tab="coupe"]').on("drop", this._onDrop.bind(this));
        //html.find('div[data-tab="coupe"] .item-edit').click(this._onEditItem.bind(this));
        //html.find('div[data-tab="coupe"] .item-delete').click(this._onDeleteItem.bind(this));

        // Denier
        //html.find('div[data-tab="denier"]').on("drop", this._onDrop.bind(this));
        //html.find('div[data-tab="denier"] .item-edit').click(this._onEditItem.bind(this));
        //html.find('div[data-tab="denier"] .item-delete').click(this._onDeleteItem.bind(this));

        // Epee
        //html.find('div[data-tab="epee"]').on("drop", this._onDrop.bind(this));
        //html.find('div[data-tab="epee"] .item-edit').click(this._onEditItem.bind(this));
        //html.find('div[data-tab="epee"] .item-delete').click(this._onDeleteItem.bind(this));

    }

    /**
     * Drop the specified object.
     * @param event The drop event.
     */
    async _onDrop(event) {

        // Catch and retrieve the dropped item
        event.preventDefault();
        const item = await NephilimItemSheet.droppedItem(event);
        if (item == null) {

            // Catch and retrieve the dropped actor
            if (this.actor.system.options.simulacre === true) {
                const actor = await FigureSheet.droppedActor(event);
                if (actor !== null && actor.hasOwnProperty('system') && actor.type === "figurant" && actor.sid != "") {
                    await this.actor.update({ ['system.simulacre']: actor.sid });
                }
            }

        } else if (item.hasOwnProperty('system')) {

            switch(item.type) {
                case 'arme':
                    await super._onDropWeapon(event, item);
                    break;
                case 'armure':
                    await super._onDrop(event);
                    break;
                case 'alchimie':
                case 'aspect':
                case 'catalyseur':
                case 'competence':
                case 'magie':
                case 'materiae':
                case 'metamorphe':
                case 'periode':
                case 'vecu':
                    await new AbstractRollBuilder(this.actor)
                        .withItem(item)
                        .withEvent(event)
                        .withPeriode(this.editedPeriode)
                        .withManoeuver(this.editedCapacity)
                        .create()
                        .drop();
                    break;
                case 'appel':
                case 'arcane':
                case 'chute':
                case 'formule':
                case 'invocation':
                case 'ordonnance':
                case 'passe':
                case 'quete':
                case 'rite':
                case 'savoir':
                case 'science':
                case 'sort':
                    const periode = this._periodeOnDrop();
                    if (periode != null) {
                        await new AbstractRollBuilder(this.actor)
                            .withItem(item)
                            .withEvent(event)
                            .withPeriode(periode)
                            .withManoeuver(this.editedCapacity)
                            .create()
                            .drop();
                    }
                    break;

            }

        }

    }

    /**
     * @returns the periode identifier on which to link the dropped item.
     */
    _periodeOnDrop() {
        //const p = this.editedPeriode != null ? this.editedPeriode : this.actor.system.periode;
        return this.editedPeriode;
    }

    // -------------------------------------> Item edition

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

    // -- COMBAT-- ------------------------------------------------------------------------

    /**
     * Edit or unedit the esquive capacity.
     * @param event The click event.
     */
     async _onEditEsquive(event) {
        event.preventDefault();
        this.editedCapacity = this.editedCapacity === 'esquive' ? null : 'esquive';
        await this.render(true);
    }
    
    /**
     * Edit or unedit the lutte capacity.
     * @param event The click event.
     */
     async _onEditLutte(event) {
        event.preventDefault();
        this.editedCapacity = this.editedCapacity === 'lutte' ? null : 'lutte';
        await this.render(true);
    }

    // -- FEATURE ------------------------------------------------------------------------

    /**
     * Edit the specified feature.
     * @param feature The purpose of the edition.
     * @param event   The click event.
     * @returns the instance.
     */
    async _onEditFeature(feature, event) {
        event.preventDefault();
        await this.createFeature(".edit-" + feature, event).edit();
        return this;
    }

    /**
     * Roll the specified feature.
     * @param feature The purpose of the roll.
     * @param event   The click event.
     * @returns the instance.
     */
    async _onRollFeature(feature, event) {
        event.preventDefault();
        await this.createFeature(".roll-" + feature, event).initialize();
        return this;
    }

    // -- INCARNATION------------------------------------------------------------------------

    /**
     * Edit or unedit the specified periode.
     * @param event The click event.
     */
    async _onEditPeriode(event) {
        event.preventDefault();
        const feature = this.createFeature(".item", event);
        this.editedPeriode = this.editedPeriode === feature.sid ? null : feature.sid;
        await this.render(true);
    }

    /**
     * Delete the specified periode.
     * @param event The click event.
     */
    async _onDeletePeriode(event) {
        event.preventDefault();
        const feature = this.createFeature(".item", event);
        if (this.editedPeriode === feature.sid) {
            this.editedPeriode = null;
        }
        this.elapsedPeriodes = this.elapsedPeriodes.filter(i => i !== feature.item.id);
        await feature.delete();
        if (feature.sid === this.actor.system.periode) {
            const first = this.actor.items.find(i => i.type === 'periode' && i.system.previous === null);
            await this.actor.setCurrentPeriode(first?.sid);
        }
    }

    /**
     * Set the specified current periode.
     * @param event The click event.
     */
    async _onCurrentPeriode(event) {
        event.preventDefault();
        const feature = this.createFeature(".item", event);
        await this.actor.setCurrentPeriode(feature.sid);
    }

    /**
     * Show or hide the specified feature.
     * @param event The click event.
     */
    async _onDisplayPeriode(event) {
        event.preventDefault();
        const node = $(event.currentTarget).parent().next();
        const id = node.data('id');
        await this._updateDisplayPeriode(node, id);
    }

    /**
     * Used to elapse or colapse all periodes in incarnations.
     * @param event The click event.
     */
    async _onChangePeriodesDisplay(event) {
        event.preventDefault();
        const checked = $(event.currentTarget).closest(".incarnationsOuvertes").is(':checked');
        await this.actor.update({ ['system.options.incarnationsOuvertes']: checked });
        this.elapsedPeriodes = this._initialElapsedPeriodes();
        await this.render(true);
    }

    /**
     * @param id   The identifier of the periode to display or to show.
     * @param node The node on which to update the periode.
     */
    async _updateDisplayPeriode(node, id) {
        if (node.css('display') !== 'none') {
            this.elapsedPeriodes = this.elapsedPeriodes.filter(i => i !== id);
            node.attr("style", "display: none;");
        } else {
            this.elapsedPeriodes.push(id);
            node.removeAttr("style");
        }
    }

    /**
     * Set the degre in the linked item.
     * @param event The click event.
     */
     async _onChangeDegre(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".change-degre").data("id");
        const item = this.actor.items.get(id);
        const value = $(event.currentTarget).closest(".change-degre").val();
        const system = duplicate(item.system);
        system.degre = parseInt(value);
        await item.update({ ['system']: system });
    }

    /**
     * Active or deactive the specified periode.
     * @param event The click event. 
     */
    async _onToggleActivePeriode(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".active-periode").data("id");
        const item = game.items.get(id);
        await new AbstractRollBuilder(this.actor).withItem(item).create().toggleActive();
    }

    // -- IMAGO -----------------------------------------------------------------------------

    /**
     * Set the specified metamorphose to be formed or not.
     * @param event The click event.
     */
    async _onToggleFormed(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".formed").data("id");
        const item = game.items.get(id);
        const index = $(event.currentTarget).closest(".formed").data("index");
        await new AbstractRollBuilder(this.actor).withItem(item).create().toggleFormed(index);
    }

    // -- METAMORPHE ------------------------------------------------------------------------

    /**
     * Set the specified metamorphose to be visible or not.
     * @param event The click event.
     */
    async _onToggleVisible(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".visible").data("id");
        const item = game.items.get(id);
        const index = $(event.currentTarget).closest(".visible").data("index");
        await new AbstractRollBuilder(this.actor).withItem(item).create().toggleVisible(index);
    }

    /**
     * Set the specified aspect of the imago to be active or not.
     * @param event The click event.
     */
    async _onToggleActive(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".active").data("id");
        const item = game.items.get(id);
        await new AbstractRollBuilder(this.actor).withItem(item).create().toggleActive();
    }

    // -- CHUTES ------------------------------------------------------------------------

    /**
     * Set the specified khaiba.
     * @param event The click event.
     */
    async _onKhaiba(event) {
        event.preventDefault();
        if (this.actor.system.periode != null) {
            const chute = Chute.getKhaiba(this.actor);
            await this._onChute(event, 'khaiba', chute.degre, true);
        }
    }

    /**
     * Set the specified narcose.
     * @param event The click event.
     */
     async _onNarcose(event) {
        event.preventDefault();
        if (this.actor.system.periode != null) {
            const chute = Chute.getNarcose(this.actor);
            await this._onChute(event, 'narcose', chute.degre, false);
        }
    }

    /**
     * Set the specified ombre.
     * @param event The click event.
     */
     async _onOmbre(event) {
        event.preventDefault();
        if (this.actor.system.periode != null) {
            const chute = Chute.getOmbre(this.actor);
            await this._onChute(event, 'ombre', chute.degre, false);
        }
    }

    /**
     * Set the specified lune noire.
     * @param event The click event.
     */
    async _onLuneNoire(event) {
        event.preventDefault();
        if (this.actor.system.periode != null) {
            const chute = Chute.getLuneNoire(this.actor);
            await this._onChute(event, 'luneNoire', chute.degre, false);
        }
    }

    /**
     * 
     * @param {*} event 
     * @param {*} key 
     * @param {*} degre 
     */
    async _onChute(event, key, degre, find) {

        // Retrieve the degre on which the user has clicked
        const id = $(event.currentTarget).closest("." + key).data("id");

        // Create or update current chute according to the current periode, first chute by default
        let chute = this.actor.items.find(i => i.type === "chute" && i.system.key === key && i.system.periode === this.actor.system.periode);
        if (chute == null) {

            // Look for a previous chute wih same key to get the chute item. Use to retrieve the type of khaiba 
            if (find === true) {

                // If no chute during the current periode, reload the past to find a chute
                for (let periode of Periode.getSorted(this.actor, false, true)) {

                    // Skip the current periode bacause already processed
                    if (periode === this.actor.system.periode) {
                        continue;
                    }

                    // Look for the first chute of the periode
                    chute = this.actor.items.find(i => i.type === "chute" && i.system.key === key && i.system.periode === periode.sid);
                    if (chute != null) {
                        break;
                    }

                }

            }

            // No chute has been found, create a default one
            if (chute == null) {
                chute = game.items.find(i => i.type === 'chute' && i.system.key === key);
                if (chute == null) {
                    ui.notifications.warn("Veuillez copier les chutes du pack système dans votre monde");
                    return;
                }
            }

            const value = (id === 1 && degre == 1) ? -1 : (id - degre);
            await new EmbeddedItem(this.actor, chute.sid)
                .withData("periode", this.actor.system.periode)
                .withData("degre", value)
                .withData("key", key)
                .withoutData('description')
                .withoutAlreadyEmbeddedError()
                .create();
        } else {
            const value = (id === 1 && degre == 1) ? (chute.system.degre - degre) : (chute.system.degre + id - degre);
            await chute.update({ ['system.degre']: value }); 
        }

    }


    // -- SORT, INVOCATION, FORMULE, RITE, APPEL --------------------------------------------

    /**
     * Set the number of vaisseaux alchimiques.
     * Used by:
     *  - formule
     * @param event The click event.
     */
    async _onChangeQuantite(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".change-quantite").data("id");
        const item = this.actor.items.get(id);
        const value = $(event.currentTarget).closest(".change-quantite").val();
        const system = duplicate(item.system);
        system.quantite = parseInt(value);
        await item.update({ ['system']: system });
    }

    /**
     * Set the number of vaisseaux alchimiques.
     * Used by:
     *  - formule
     * @param event The click event.
     */
    async _onChangeTransporte(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".change-transporte").data("id");
        const item = this.actor.items.get(id);
        const value = $(event.currentTarget).closest(".change-transporte").val();
        const system = duplicate(item.system);
        system.transporte = parseInt(value);
        await item.update({ ['system']: system });
    }

    /**
     * Set the pacte of the item.
     * Used by:
     *  - invocation
     * @param event The click event.
     */
    async _onChangePacte(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".change-pacte").data("id");
        const item = this.actor.items.get(id);
        const system = duplicate(item.system);
        system.pacte = !system.pacte;
        await item.update({ ['system']: system });
    }

    /**
     * Set the focus of the item.
     * Used by:
     *  - sort
     *  - invocation
     *  - formule
     *  - rite
     *  - appel
     * @param event The click event.
     */
    async _onChangeFocus(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".change-focus").data("id");
        const item = this.actor.items.get(id);
        const system = duplicate(item.system);
        system.focus = !system.focus;
        await item.update({ ['system']: system });
    }

    /**
     * Changes the status of the item.
     *  - If the item was dechiffre, it becomes appris.
     *  - If the item was appris, it becomes tatoue.
     *  - If the item was tatoue, it becomes dechiffre.
     * Used by:
     *  - sort
     *  - invocation
     *  - formule
     *  - rite
     *  - appel
     * @param event The click event.
     */
    async _onChangeStatus(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest(".change-status").data("id");
        const item = this.actor.items.get(id);
        const system = duplicate(item.system);
        switch (item.system.status) {
            case Constants.DECHIFFRE:
                system.status = Constants.APPRIS;
                break;
            case Constants.APPRIS:
                system.status = Constants.TATOUE;
                break;
            case Constants.TATOUE:
                system.status = Constants.DECHIFFRE;
                break;
            default:
                throw new Error("Status " + item.system.status + " not implemented");
        }
        await item.update({ ['system']: system });
    }

    // -- SIMULACRE -------------------------------------------------------------------------

    /**
     * Edit the simulacre.
     * @param event The click event.
     */
    async _onOpenSimulacre(event) {
        event.preventDefault();
        const simulacre = this.actor.simulacre;
        if (simulacre != null) {
            simulacre.sheet.render(true);
        }
    }


    static async droppedActor(event) {

        // Retrieve the dropped data id and type from the event
        let data = null;
        if (event.dataTransfer !== undefined) {
            try {
                data = JSON.parse(event.dataTransfer.getData('text/plain'));
            } catch (err) {
                return null;
            }
        }
        if (data === null || data.type !== "Actor") {
            return null;
        };
    
        let dataType = "";
        if (data.type === "Actor") {
            let actorData = {};
            // Case 1 - Import from a Compendium pack
            if (data.pack) {
                dataType = "compendium";
                const pack = game.packs.find(p => p.collection === data.pack);
                const packActor = await pack.getEntity(data.id);
                if (packActor != null) actorData = packActor.data;
            }
    
            // Case 3 - Import from World entity
            else {
                return await fromUuid(data.uuid);
            }
    
            return { from: dataType, data: actorData };
    
        } else {
    
            return null;
        }
    
    }

}