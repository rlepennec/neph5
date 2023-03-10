import { AbstractRollBuilder } from "../../feature/core/AbstractRollBuilder.js";
import { Chute } from "../../feature/periode/chute.js";
import { Constants } from "../common/constants.js";
import { EmbeddedItem } from "../common/embeddedItem.js";
import { FeatureBuilder } from "../../feature/core/featureBuilder.js";
import { Game } from "../common/game.js";
import { HistoricalSheet } from "./historical.js";
import { Periode } from "../../feature/periode/periode.js";

export class FigureSheet extends HistoricalSheet {

    /**
     * @constructor
     * @param args
     */
    constructor(...args) {
        super(...args);
        this.editedCapacity = null;
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
            width: 1030,
            height: 850,
            classes: ["nephilim", "sheet", "actor"],
            resizable: true,
            scrollY: [
                ".tab.description",
                ".tab.vecus",
                ".tab.nephilim",
                ".tab.magie",
                ".tab.analogie",
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
                    navSelector: ".sheet-navigation",
                    contentSelector: ".article-body",
                    initial: "description"
                }]
        });
    }

    /**
     * @override
     */
    getData() {
        return mergeObject(super.getData(), {
            cercles: Game.alchimie.cercles,
            domaines: Game.analogie.domaines,
            catalyseurs: game.settings.get('neph5e', 'catalyseurs'),
            useCombatSystem: game.settings.get('neph5e', 'useCombatSystem'),
            editedCapacity: this.editedCapacity,
            simulacre: this.actor.simulacre
        });
    }

    /**
     * @override
     */
    activateListeners(html) {

        super.activateListeners(html);

        // General
        html.find('div[data-tab]').on("drop", this._onDrop.bind(this));

        // Sciences occultes
        html.find('div[data-family="science"] .cercle-header .roll').click(this._onRollItem.bind(this));
        html.find('div[data-family="science"] .focus .open').click(this._onOpenItem.bind(this));
        html.find('div[data-family="science"] .focus .roll').click(this._onRollItem.bind(this));
        html.find('div[data-family="science"] .focus-possede').click(this._onChangeFocus.bind(this));
        html.find('div[data-family="science"] .focus-status').click(this._onChangeStatus.bind(this));
        html.find('div[data-family="science"] .focus-pacte').click(this._onChangePacte.bind(this));
        html.find('div[data-family="science"] .focus-quantite').change(this._onChangeQuantite.bind(this));
        html.find('div[data-family="science"] .focus-transporte').change(this._onChangeTransporte.bind(this));

        // Vecus
        html.find('div[data-family="vecus"] .vecu .open').click(this._onOpenItem.bind(this));
        html.find('div[data-family="vecus"] .vecu .roll').click(this._onRollItem.bind(this));

        // Akasha
        html.find('div[data-tab="akasha"] .vaisseau').click(this._onToggleVaisseau.bind(this));

        // Incarnations
        html.find('div[data-tab="incarnations"] .activate').click(this._onToggleActivePeriode.bind(this));




        // Fraternites
        html.find('.sheet-navigation-tab[data-tab="actor"]').click(this._onOpenActor.bind(this));

        // Combat
        html.find('div[data-tab="combat"] .edit-esquive').click(this._onEditEsquive.bind(this));
        html.find('div[data-tab="combat"] .edit-lutte').click(this._onEditLutte.bind(this));

        // Incarnations
        html.find('div[data-tab="incarnations"] .delete-periode').click(this._onDeletePeriode.bind(this));
        html.find('div[data-tab="incarnations"] .current-periode').click(this._onCurrentPeriode.bind(this));
        html.find('div[data-tab="incarnations"] .delete-item').click(this._onDeleteEmbeddedItem.bind(this));
        html.find('div[data-tab="incarnations"] .edit-periode').click(this._onEditPeriode.bind(this));
        html.find('div[data-tab="incarnations"] .edit-vecu').click(this._onOpenItem.bind(this));
        html.find('div[data-tab="incarnations"] .edit-item').click(this._onEditFeature.bind(this, 'item'));
        html.find('div[data-tab="incarnations"] .change-degre').change(this._onChangeDegre.bind(this));
        html.find('div[data-tab="incarnations"] .active-periode').click(this._onToggleActivePeriode.bind(this));
        html.find('div[data-tab="incarnations"] .display').click(this._onDisplayPeriode.bind(this));

        // Kabbale
        html.find('div[data-tab="kabbale"] .edit-ordonnance').click(this._onEditFeature.bind(this, 'ordonnance'));
        
        // Laboratoire
        html.find('div[data-tab="laboratoire"] .change-quantite').change(this._onChangeQuantite.bind(this));
        html.find('div[data-tab="laboratoire"] .edit-catalyseur').click(this._onEditFeature.bind(this, 'catalyseur'));
        html.find('div[data-tab="laboratoire"] .edit-materiae').click(this._onEditFeature.bind(this, 'materiae'));
        html.find('div[data-tab="laboratoire"] .item-delete').click(this._onDeleteEmbeddedItem.bind(this));
        html.find('div[data-tab="laboratoire"] .actor-delete').click(this._onDeleteLaboratory.bind(this));
        html.find('div[data-tab="laboratoire"] .actor-name').click(this._onActiveLaboratory.bind(this));
        
        // Nephilim
        html.find('div[data-tab="nephilim"] .formed').click(this._onToggleFormed.bind(this));
        html.find('div[data-tab="nephilim"] .visible').click(this._onToggleVisible.bind(this));
        html.find('div[data-tab="nephilim"] .edit-metamorphe').click(this._onEditFeature.bind(this, 'metamorphe'));
        html.find('div[data-tab="nephilim"] .edit-arcane').click(this._onEditFeature.bind(this, 'arcane'));
        //html.find('div[data-tab="nephilim"] .roll-arcane').click(this._onRollFeature.bind(this, 'arcane'));
        //html.find('div[data-tab="nephilim"] .roll-ka').click(this._onRollFeature.bind(this, 'ka'));
        html.find('div[data-tab="nephilim"] .khaiba').click(this._onKhaiba.bind(this));
        html.find('div[data-tab="nephilim"] .narcose').click(this._onNarcose.bind(this));
        html.find('div[data-tab="nephilim"] .ombre').click(this._onOmbre.bind(this));
        html.find('div[data-tab="nephilim"] .luneNoire').click(this._onLuneNoire.bind(this));

        // Selenim
        html.find('div[data-tab="selenim"] .edit-aspect').click(this._onEditFeature.bind(this, 'aspect'));
        //html.find('div[data-tab="selenim"] .roll-pavane').click(this._onRollFeature.bind(this, 'pavane'));
        //html.find('div[data-tab="selenim"] .roll-noyau').click(this._onRollFeature.bind(this, 'noyau'));
        html.find('div[data-tab="selenim"] .item-delete').click(this._onDeleteEmbeddedItem.bind(this));
        html.find('div[data-tab="selenim"] .active').click(this._onToggleActive.bind(this));

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

    }

    /**
     * Drop the specified object.
     * @param event The drop event.
     */
    async _onDrop(event) {

        // Catch and retrieve the dropped item
        event.preventDefault();
        const dropped = await super.droppedObject(event);
        switch (dropped?.type) {
            case 'item':
                const item = dropped.object;
                if (item.hasOwnProperty('system')) {

                    // Check if the tab is compliant with the item to drop
                    const currentTab = $(event.currentTarget).find("div.tab.active").data("tab");
                    const tabs = this._droppableTabs(item.type);
                    if (tabs.includes(currentTab) !== true) {
                        return false;
                    }

                    // Process the drop
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
                            await new FeatureBuilder(this.actor)
                                .withItem(item.sid)
                                .withEvent(event)
                                .withPeriode(this.editedPeriode)
                                .withManoeuver(this.editedCapacity)
                                .create()
                                .drop();
                            break;
                        case 'arcane':
                        case 'chute':
                        case 'ordonnance':
                        case 'passe':
                        case 'quete':
                        case 'savoir':
                        case 'science': {
                            if (this.editedPeriode != null) {
                                await new FeatureBuilder(this.actor)
                                    .withOriginalItem(item.sid)
                                    .withEvent(event)
                                    .withPeriode(this.editedPeriode)
                                    .withManoeuver(this.editedCapacity)
                                    .create()
                                    .drop();
                            }
                            break;
                        }
                        case 'appel':
                        case 'atlanteide':
                        case 'dracomachie':
                        case 'formule':
                        case 'invocation':
                        case 'pratique':
                        case 'rite':
                        case 'rituel':
                        case 'technique':
                        case 'tekhne':
                        case 'sort':
                        case 'habitus': {
                            if (this.editedPeriode != null) {
                                await new FeatureBuilder(this.actor)
                                    .withOriginalItem(item.sid)
                                    .withPeriode(this.editedPeriode)
                                    .create()
                                    .drop();
                            }
                            break;
                        }
                    }
                }
                break;

            case 'actor':
                const actor = dropped.object;
                switch (actor.type) {

                    // Drop the new simulacre on the figure
                    case 'figurant':
                        if (this.actor.system.options.simulacre === true && actor.hasOwnProperty('system') && actor.sid != "") {
                            await this.actor.update({ ['system.simulacre']: actor.sid });
                        }
                        break;

                    // Drop the new laboratoire
                    case 'figure':
                        const currentTab = $(event.currentTarget).find("div.tab.active").data("tab");
                        if (currentTab === 'laboratoire') {
                            const laboratoires = this.actor.system.alchimie.laboratoires;
                            if (!laboratoires.includes(actor.sid)) {
                                laboratoires.push(actor.sid);
                                await this.actor.update({ ['system.alchimie.laboratoires']: laboratoires });
                            }
                        }
                        break;

                }
                break;
        }

    }

    /**
     * @param type The type of item to drop.
     * @returns the tabs on which the item can be dropped.
     */
    _droppableTabs(type) {
        switch (type) {
            case 'arme':
            case 'armure':
            case 'competence':
                return ['combat'];
            case 'alchimie':
                return ['alchimie'];
            case 'aspect':
                return ['selenim'];
            case 'magie':
                return ['magie'];
            case 'catalyseur':
            case 'materiae':
                return ['laboratoire'];
            case 'metamorphe':
                return ['nephilim'];
            case 'vecu':
                return ['combat','incarnations'];
            case 'periode':
            case 'appel':
            case 'arcane':
            case 'atlanteide':
            case 'chute':
            case 'dracomachie':
            case 'formule':
            case 'habitus':
            case 'invocation':
            case 'ordonnance':
            case 'passe':
            case 'pratique':
            case 'quete':
            case 'rite':
            case 'rituel':
            case 'savoir':
            case 'science':
            case 'sort':
            case 'technique':
            case 'tekhne':
                return ['incarnations'];
            default:
                return [];
        }
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
     * @param event The click event.
     * @param key   The key of the chute item.
     * @param degre The degre of the chute to set.
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
     * Active the specified laboratory.
     * @param event The click event.
     */
    async _onActiveLaboratory(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".actor");
        const sid = li.data("actor-id");
        const actor = game.actors.find(i => i.sid === sid);
        if (actor != null) {
            if (this.actor.system.alchimie.courant === actor.sid) {
                await this.actor.update({ ['system.alchimie.courant']: null });
            } else {
                await this.actor.update({ ['system.alchimie.courant']: actor.sid });
            }
        }
    }

    /**
     * Delete the specified laboratory.
     * @param event The click event.
     */
    async _onDeleteLaboratory(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".actor");
        const sid = li.data("actor-id");
        const actor = game.actors.find(i => i.sid === sid);
        if (actor != null) {
            const laboratoires = this.actor.system.alchimie.laboratoires;
            if (laboratoires.includes(actor.sid)) {
                const labs = laboratoires.filter(i => i !== actor.sid);
                await this.actor.update({ ['system.alchimie.laboratoires']: labs });
            }
            if (this.actor.system.alchimie.courant === actor.sid) {
                await this.actor.update({ ['system.alchimie.courant']: null });
            }
        }
    }



    // -- SIMULACRE & FRATERNITE -------------------------------------------------------------------------

    /**
     * Open the simulacre or the fraternite.
     * @param event The click event.
     */
    async _onOpenActor(event) {
        event.preventDefault();
        const id = $(event.currentTarget).closest('.sheet-navigation-tab[data-tab="actor"]').data('id');
        const actor = game.actors.get(id);
        if (actor != null) {
            actor.sheet.render(true);
        }
    }

    // After refactoring
    // -------------------------------------------------------------------------

    /**
     * Create the specified feature item.
     * @param event The click event.
     * @returns the new feature.
     */
    _createFeature(event) {
        event.preventDefault();
        const node = $(event.currentTarget).closest('.item');
        const id = node.data('id');
        const sid = node.data('sid');
        const scope = node.data("scope");
        return new FeatureBuilder(this.actor).withScope(scope).withEmbeddedItem(id).withOriginalItem(sid).create();
    }

    /**
     * Open the specified embedded item.
     * @param event The click event.
     * @returns the instance.
     */
    async _onOpenItem(event) {
        const feature = this._createFeature(event);
        await feature.edit();
        return this;
    }

    /**
     * Roll the specified original item.
     * @param event The click event.
     * @returns the instance.
     */
    async _onRollItem(event) {
        const feature = this._createFeature(event);
        await feature.initializeRoll();
        return this;
    }

    /**
     * Set the number of vaisseaux alchimiques.
     * Used by:
     *  - formule
     * @param event The click event.
     */
    async _onChangeQuantite(event) {
        event.preventDefault();
        const sid = $(event.currentTarget).closest('.item').data('sid');
        const item = this.actor.items.find(i => i.sid === sid);
        const value = $(event.currentTarget).closest(".focus-quantite").val();
        await item.update({ ['system.quantite']: parseInt(value) });
    }

    /**
     * Set the number of vaisseaux alchimiques.
     * Used by:
     *  - formule
     * @param event The click event.
     */
    async _onChangeTransporte(event) {
        event.preventDefault();
        const sid = $(event.currentTarget).closest('.item').data('sid');
        const item = this.actor.items.find(i => i.sid === sid);
        const value = $(event.currentTarget).closest(".focus-transporte").val();
        await item.update({ ['system.transporte']: parseInt(value) });
    }

    /**
     * Set the pacte of the item.
     * Used by:
     *  - invocation
     * @param event The click event.
     */
    async _onChangePacte(event) {
        event.preventDefault();
        const sid = $(event.currentTarget).closest('.item').data('sid');
        const item = this.actor.items.find(i => i.sid === sid);
        await item.update({ ['system.pacte']: !item.system.pacte });
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
        const sid = $(event.currentTarget).closest('.item').data('sid');
        const item = this.actor.items.find(i => i.sid === sid);
        await item.update({ ['system.focus']: !item.system.focus });
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
        const sid = $(event.currentTarget).closest('.item').data('sid');
        const item = this.actor.items.find(i => i.sid === sid);
        switch (item.system.status) {
            case Constants.DECHIFFRE:
                await item.update({ ['system.status']: Constants.APPRIS });
                break;
            case Constants.APPRIS:
                await item.update({ ['system.status']: Constants.TATOUE });
                break;
            case Constants.TATOUE:
                await item.update({ ['system.status']: Constants.DECHIFFRE });
                break;
            default:
                throw new Error("Status " + item.system.status + " not implemented");
        }
    }


    /**
     * Activate or deactivate the vaisseau for akasha.
     * @param event The click event.
     */
    async _onToggleVaisseau(event) {
        event.preventDefault();
        const vaisseau = $(event.currentTarget).closest('.vaisseau').data('type');
        const activated = this.actor.system.akasha[vaisseau].active;
        await this.actor.update({ ['system.akasha.' + vaisseau + ".active"]: !activated });
    }

}