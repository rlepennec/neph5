import { droppedActor } from "../../item/tools.js";
import { droppedItem } from "../../item/tools.js";
import { deleteItemOf } from "../tools.js";
import { CustomHandlebarsHelpers } from "../../common/handlebars.js";
import { getByPath } from "../../common/tools.js";
import { UUID } from "../../common/tools.js";
import { Game } from "../../common/game.js";

export class FigureSheet extends ActorSheet {

    /**
     * @constructor
     * @param  {...any} args
     */
    constructor(...args) {
        super(...args);
        this.options.submitOnClose = true;
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
                ".tab.incarnations",
                ".tab.options"],
            tabs: [
                { navSelector: ".tabs",
                  contentSelector: ".sheet-body",
                  initial: "vecus" }]
      });
    }

    getData() {
        const baseData = super.getData();
        let sheetData = {
            owner: this.actor.isOwner,
            editable: this.isEditable,
            actor: baseData.actor,
            data: baseData.actor.data.data,
            metamorphes: game.items.filter(item  => item.data.type === 'metamorphe'),
            cercles: Game.alchimie.cercles,
            currentPeriode: this.current != null ? this.current.data.data.id : null,
            useV3: game.settings.get('neph5e', 'useV3')
        }
        return sheetData;
    }

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);

        // Simulacre
        html.find('div[data-tab="simulacre"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="simulacre"] .item-roll').click(this._onSimulacreRoll.bind(this));

        // Nephilim
        html.find('div[data-tab="nephilim"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="nephilim"] .item-roll').click(this._onNephilimRoll.bind(this));
    
        // Vecus
        html.find('div[data-tab="vecus"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="vecus"] .item-roll').click(this._onItemRoll.bind(this));

        // Magie
        html.find('div[data-tab="magie"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="magie"] .item-name').click(this._onShowSort.bind(this));
        html.find('div[data-tab="magie"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="magie"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="magie"] .item-delete').click(this._onDeleteMagie.bind(this));

        // Kabbale
        html.find('div[data-tab="kabbale"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="kabbale"] .item-name').click(this._onShowInvocation.bind(this));
        html.find('div[data-tab="kabbale"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="kabbale"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="kabbale"] .item-delete').click(this._onDeleteKabbale.bind(this));

        // Alchimie
        html.find('div[data-tab="alchimie"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="alchimie"] .item-name').click(this._onShowFormule.bind(this));
        html.find('div[data-tab="alchimie"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="alchimie"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="alchimie"] .item-delete').click(this._onDeleteAlchimie.bind(this));

        // Laboratoire
        html.find('div[data-tab="laboratoire"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="laboratoire"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="laboratoire"] .item-delete').click(this._onDeleteLaboratoire.bind(this));

        // Incarnations
        html.find('div[data-tab="incarnations"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="incarnations"] .item-edit').click(this._onEditIncarnations.bind(this));
        html.find('div[data-tab="incarnations"] .item-delete').click(this._onDeleteIncarnations.bind(this));

        // Selenim
        html.find('div[data-tab="selenim"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="selenim"] .item-roll').click(this._onSelenimRoll.bind(this));
        html.find('div[data-tab="selenim"] .item-name').click(this._onShowAspect.bind(this));
        html.find('div[data-tab="selenim"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="selenim"] .item-delete').click(this._onDeleteImago.bind(this));

        // Conjuration
        html.find('div[data-tab="conjuration"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="conjuration"] .item-name').click(this._onShowAppel.bind(this));
        html.find('div[data-tab="conjuration"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="conjuration"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="conjuration"] .item-delete').click(this._onDeleteConjuration.bind(this));

        // Necromancie
        html.find('div[data-tab="necromancie"]').on("drop", this._onDrop.bind(this));
        html.find('div[data-tab="necromancie"] .item-name').click(this._onShowRite.bind(this));
        html.find('div[data-tab="necromancie"] .item-roll').click(this._onItemRoll.bind(this));
        html.find('div[data-tab="necromancie"] .item-edit').click(this._onEditItem.bind(this));
        html.find('div[data-tab="necromancie"] .item-delete').click(this._onDeleteNecromancie.bind(this));

    }

    /**
     * This function catches the drop
     * @param {*} event 
     */
    async _onDrop(event) {

        // Catch and retrieve the dropped item
        event.preventDefault();
        const item = await droppedItem(event);
        if (item != null && item.hasOwnProperty('data')) {

            // The metamorphe has been dropped:
            //   - Update the reference of the metamorphe
            //   - Delete the metamorphoses
            if (item.data.type === "metamorphe") {
                const metamorphe = duplicate(this.actor.data.data.metamorphe);
                metamorphe.refid = item.data.data.id;
                metamorphe.metamorphoses = [false, false, false, false, false, false, false, false, false, false];
                await this.actor.update({['data.metamorphe']: metamorphe});
            }

            // The periode has been dropped:
            //   - Add the periode if added
            //   - Delete the periodes
            if (item.data.type === "periode") {
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
                        sciences: [] };
                    periodes.push(periode);
                }
                await this.actor.update({['data.periodes']: periodes});
            }

            // The vecu has been dropped:
            //   - Add the vecu if added
            //   - Delete the vecus
            if (item.data.type === "vecu") {
                const tab = event.currentTarget.className;

                if (tab.includes("simulacre")) {
                    const simulacre = duplicate(this.actor.data.data.simulacre);
                    simulacre.vecu.refid = item.data.data.id;
                    simulacre.vecu.degre = 0;
                    await this.actor.update({['data.simulacre']: simulacre});

                } else if (tab.includes("incarnations")) {
                    const periode = this.periodeOf(item.data.data.id);
                    if (this.current && periode != undefined && this.current.data.data.id === periode.data.data.id) {
                        const periodes = duplicate(this.actor.data.data.periodes);
                        const index = periodes.findIndex(p => (p.refid === periode.data.data.id));
                        if (index != -1) {
                            const defined = periodes[index].vecus.findIndex(vecu => (vecu.refid === item.data.data.id));
                            if (defined === -1) {
                                const vecu = {
                                    refid: item.data.data.id,
                                    degre: 0
                                }
                                periodes[index].vecus.push(vecu);
                                await this.actor.update({['data.periodes']: periodes});
                            }
                        }
                    }
                }

            }

            // The savoir has been dropped:
            //   - Add the savoir if added
            //   - Delete the savoirs
            if (item.data.type === "savoir") {
                if (this.current) {
                    const periodes = duplicate(this.actor.data.data.periodes);
                    const index = periodes.findIndex(p => (p.refid === this.current.data.data.id));
                    if (index != -1) {
                        const defined = periodes[index].savoirs.findIndex(savoir => (savoir.refid === item.data.data.id));
                        if (defined === -1) {
                            const savoir = {
                                refid: item.data.data.id,
                                degre: 0
                            }
                            periodes[index].savoirs.push(savoir);
                            await this.actor.update({['data.periodes']: periodes});
                        }
                    }
                }
            }

            // The quete has been dropped:
            //   - Add the quete if added
            //   - Delete the quetes
            if (item.data.type === "quete") {
                if (this.current) {
                    const periodes = duplicate(this.actor.data.data.periodes);
                    const index = periodes.findIndex(p => (p.refid === this.current.data.data.id));
                    if (index != -1) {
                        const defined = periodes[index].quetes.findIndex(quete => (quete.refid === item.data.data.id));
                        if (defined === -1) {
                            const quete = {
                                refid: item.data.data.id,
                                degre: 0
                            }
                            periodes[index].quetes.push(quete);
                            await this.actor.update({['data.periodes']: periodes});
                        }
                    }
                }
            }

            // The arcane has been dropped:
            //   - Add the arcane if added
            //   - Delete the arcane
            if (item.data.type === "arcane") {
                if (this.current) {
                    const periodes = duplicate(this.actor.data.data.periodes);
                    const index = periodes.findIndex(p => (p.refid === this.current.data.data.id));
                    if (index != -1) {
                        const defined = periodes[index].arcanes.findIndex(arcane => (arcane.refid === item.data.data.id));
                        if (defined === -1) {
                            const arcane = {
                                refid: item.data.data.id,
                                degre: 0
                            }
                            periodes[index].arcanes.push(arcane);
                            await this.actor.update({['data.periodes']: periodes});
                        }
                    }
                }
            }

            // The chute has been dropped:
            //   - Add the chute if added
            //   - Delete the chutes
            if (item.data.type === "chute") {
                if (this.current) {
                    const periodes = duplicate(this.actor.data.data.periodes);
                    const index = periodes.findIndex(p => (p.refid === this.current.data.data.id));
                    if (index != -1) {
                        const defined = periodes[index].chutes.findIndex(chute => (chute.refid === item.data.data.id));
                        if (defined === -1) {
                            const chute = {
                                refid: item.data.data.id,
                                degre: 0
                            }
                            periodes[index].chutes.push(chute);
                            await this.actor.update({['data.periodes']: periodes});
                        }
                    }
                }
            }

            // The passe has been dropped:
            //   - Add the passe if added
            //   - Delete the passes
            if (item.data.type === "passe") {
                if (this.current) {
                    const periodes = duplicate(this.actor.data.data.periodes);
                    const index = periodes.findIndex(p => (p.refid === this.current.data.data.id));
                    if (index != -1) {
                        const defined = periodes[index].passes.findIndex(passe => (passe.refid === item.data.data.id));
                        if (defined === -1) {
                            const passe = {
                                refid: item.data.data.id,
                                degre: 0
                            }
                            periodes[index].passes.push(passe);
                            await this.actor.update({['data.periodes']: periodes});
                        }
                    }
                }
            }

            // The science occulte has been dropped
            //   - Add the science if added
            //   - Delete the sciences
            if (item.data.type === "science") {
                if (this.current) {
                    const periodes = duplicate(this.actor.data.data.periodes);
                    const index = periodes.findIndex(p => (p.refid === this.current.data.data.id));
                    if (index != -1) {
                        if (periodes[index].sciences.findIndex(science => (science.refid === item.data.data.id)) == -1) {
                            const science = {
                                refid: item.data.data.id,
                                ref: item.data.data.ref,
                                degre: 0
                            }
                            periodes[index].sciences.push(science);
                            await this.actor.update({['data.periodes']: periodes});
                        }
                    }
                }
            }

            // The sort has been dropped:
            //   - Add the sort if added
            //   - Delete the sorts
            if (item.data.type === "sort") {
                const magie = duplicate(this.actor.data.data.magie);
                const index = magie.sorts.findIndex(sort => (sort.refid === item.data.data.id));
                if (index === -1) {
                    const sort = {
                        refid: item.data.data.id,
                        appris: false,
                        tatoue: false };
                    magie.sorts.push(sort);
                }
                await this.actor.update({['data.magie']: magie});
            }

            // The invocation has been dropped:
            //   - Add the invocation if added
            //   - Delete the invocations
            if (item.data.type === "invocation") {
                const kabbale = duplicate(this.actor.data.data.kabbale);
                const index = kabbale.invocations.findIndex(invocation => (invocation.refid === item.data.data.id));
                if (index === -1) {
                    const invocation = { 
                        refid: item.data.data.id,
                        appris: false,
                        tatoue: false,
                        pacte: false,
                        feal: 0,
                        allie: 0 };
                    kabbale.invocations.push(invocation);
                }
                await this.actor.update({['data.kabbale']: kabbale});
            }

            // The formule has been dropped:
            //   - Add the formule if added
            //   - Delete the formules
            if (item.data.type === "formule") {
                const alchimie = duplicate(this.actor.data.data.alchimie);
                const index = alchimie.formules.findIndex(formule => (formule.refid === item.data.data.id));
                if (index === -1) {
                    const formule = {
                        refid: item.data.data.id,
                        appris: false,
                        tatoue: false,
                        quantite: 0,
                        transporte: 0 };
                    alchimie.formules.push(formule);
                }
                await this.actor.update({['data.alchimie']: alchimie});
            }

            // The ordonnance has been dropped:
            //   - Add the ordonnance if added
            //   - Delete the ordonnances
            if (item.data.type === "ordonnance") {
                const kabbale = duplicate(this.actor.data.data.kabbale);
                const index = kabbale.voie.ordonnances.findIndex(ordonnance => (ordonnance.refid === item.data.data.id));
                if (index === -1) {
                    const ordonnance = {
                        refid: item.data.data.id };
                    kabbale.voie.ordonnances.push(ordonnance);
                }
                await this.actor.update({['data.kabbale']: kabbale});
            }

            // The voie initiatique has been dropped:
            //   - Update the reference of the magie
            //   - Delete the magie
            if (item.data.type === "magie") {
                const magie = duplicate(this.actor.data.data.magie);
                magie.voie.refid = item.data.data.id;
                await this.actor.update({['data.magie']: magie});
            }

            // The voie alchimique has been dropped:
            //   - Update the reference of the alchimie
            //   - Delete the alchimie
            if (item.data.type === "alchimie") {
                const alchimie = duplicate(this.actor.data.data.alchimie);
                alchimie.voie.refid = item.data.data.id;
                await this.actor.update({['data.alchimie']: alchimie});
            }

            // The materiae primae has been dropped:
            //   - Add the materiae if added
            //   - Delete the materiaes
            if (item.data.type === "materiae") {
                const alchimie = duplicate(this.actor.data.data.alchimie);
                const index = alchimie.materiae.findIndex(materiae => (materiae.refid === item.data.data.id));
                if (index === -1) {
                    const materiae = {
                        refid: item.data.data.id,
                        quantite: 0 };
                    alchimie.materiae.push(materiae);
                }
                await this.actor.update({['data.alchimie']: alchimie});
            }

            // The catalyseur has been dropped:
            //   - Add the catalyseur if added
            //   - Delete the catalyseurs
            if (item.data.type === "catalyseur") {
                const alchimie = duplicate(this.actor.data.data.alchimie);
                const index = alchimie.catalyseurs.findIndex(catalyseur => (catalyseur.refid === item.data.data.id));
                if (index === -1) {
                    const catalyseur = {
                        refid: item.data.data.id
                    };
                    alchimie.catalyseurs.push(catalyseur);
                }
                await this.actor.update({['data.alchimie']: alchimie});
            }

            // The aspect has been dropped:
            //   - Add the aspect if added
            //   - Delete the aspects
            if (item.data.type === "aspect") {
                const imago = duplicate(this.actor.data.data.imago);
                const index = imago.aspects.findIndex(aspect => (aspect.refid === item.data.data.id));
                if (index === -1) {
                    const aspect = {
                        refid: item.data.data.id,
                        active: false };
                    imago.aspects.push(aspect);
                }
                await this.actor.update({['data.imago']: imago});
            }

            // The appel has been dropped:
            //   - Add the appel if added
            //   - Delete the appels
            if (item.data.type === "appel") {
                const conjuration = duplicate(this.actor.data.data.conjuration);
                const index = conjuration.appels.findIndex(appel => (appel.refid === item.data.data.id));
                if (index === -1) {
                    const appel = {
                        refid: item.data.data.id,
                        appris: false };
                    conjuration.appels.push(appel);
                }
                await this.actor.update({['data.conjuration']: conjuration});
            }

            // The rite has been dropped:
            //   - Add the rite if added
            //   - Delete the rites
            if (item.data.type === "rite") {
                const necromancie = duplicate(this.actor.data.data.necromancie);
                const index = necromancie.rites.findIndex(rite => (rite.refid === item.data.data.id));
                if (index === -1) {
                    const rite = {
                        refid: item.data.data.id,
                        appris: false };
                    necromancie.rites.push(rite);
                }
                await this.actor.update({['data.necromancie']: necromancie});
            }

        } else {

            // Catch and retrieve the dropped actor
            const actor = await droppedActor(event);
            if (actor != null && actor.hasOwnProperty('data')) {

                // The metamorphe has been dropped:
                //   - Update the reference of the metamorphe
                //   - Delete the metamorphoses
                if (actor.data.type === "simulacre" && actor.data.data.id != "") {
                    const simulacre = duplicate(this.actor.data.data.simulacre);
                    simulacre.refid = actor.data.data.id;
                    await this.actor.update({['data.simulacre']: simulacre});
                }
            }

        }

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
            for (let index = 0; index < 10; index++) {
                const name = "data.metamorphoses.[" + index + "]";
                metamorphoses.push(formData[name]);
                delete formData[name];
            }
            formData["data.metamorphe.metamorphoses"] = metamorphoses;
        } else {
            formData["data.metamorphe.metamorphoses"] = this.actor.data.data.metamorphe.metamorphoses;
        }

        // Initialize the periodes of the actor
        // --------------------------------------------------------------------
        let periodes = [];
        if (formData.hasOwnProperty("data.page.incarnations")) {

            // For each periode of the actor
            for (let p of this.actor.data.data.periodes) {
                
                // Retrieve the name and the id of the periode
                const periodeName = "data.periodes.[" + p.refid + "]";

                // Initialize the vecus of the current periode of the actor
                // For each vecu of the periode of the actor
                // -----------------------------------------
                const vecus = [];
                for (let v of p.vecus) {

                    // Retrieve the vecu defined in the formData
                    const vecuName = periodeName + ".vecus.[" + v.refid + "]";
                    vecus.push({
                        refid: formData[vecuName + ".refid"],
                        degre: formData[vecuName + ".degre"] });

                    delete formData[vecuName + ".refid"];
                    delete formData[vecuName + ".degre"];

                }

                // Initialize the vecus of the current periode of the actor
                // For each savoir of the periode of the actor
                // -----------------------------------------
                const savoirs = [];
                for (let v of p.savoirs) {

                    // Retrieve the savoir defined in the formData
                    const savoirName = periodeName + ".savoirs.[" + v.refid + "]";
                    savoirs.push({
                        refid: formData[savoirName + ".refid"],
                        degre: formData[savoirName + ".degre"] });
                    delete formData[savoirName + ".refid"];
                    delete formData[savoirName + ".degre"];

                }

                // Initialize the quetes of the current periode of the actor
                // For each quete of the periode of the actor
                // -----------------------------------------
                const quetes = [];
                for (let v of p.quetes) {

                    // Retrieve the savoir defined in the formData
                    const queteName = periodeName + ".quetes.[" + v.refid + "]";
                    quetes.push({
                        refid: formData[queteName + ".refid"],
                        degre: formData[queteName + ".degre"] });
                    delete formData[queteName + ".refid"];
                    delete formData[queteName + ".degre"];
                }

                // Initialize the arcanes of the current periode of the actor
                // For each arcane of the periode of the actor
                // -----------------------------------------
                const arcanes = [];
                for (let v of p.arcanes) {

                    // Retrieve the savoir defined in the formData
                    const arcaneName = periodeName + ".arcanes.[" + v.refid + "]";
                    arcanes.push({
                        refid: formData[arcaneName + ".refid"],
                        degre: formData[arcaneName + ".degre"] });
                    delete formData[arcaneName + ".refid"];
                    delete formData[arcaneName + ".degre"];
                }

                // Initialize the chutes of the current periode of the actor
                // For each chute of the periode of the actor
                // -----------------------------------------
                const chutes = [];
                for (let v of p.chutes) {

                    // Retrieve the savoir defined in the formData
                    const chuteName = periodeName + ".chutes.[" + v.refid + "]";
                    chutes.push({
                        refid: formData[chuteName + ".refid"],
                        degre: formData[chuteName + ".degre"] });
                    delete formData[chuteName + ".refid"];
                    delete formData[chuteName + ".degre"];
                }

                // Initialize the passes of the current periode of the actor
                // For each passe of the periode of the actor
                // -----------------------------------------
                const passes = [];
                for (let v of p.passes) {

                    // Retrieve the passe defined in the formData
                    const passeName = periodeName + ".passes.[" + v.refid + "]";
                    passes.push({
                        refid: formData[passeName + ".refid"],
                        degre: formData[passeName + ".degre"] });
                    delete formData[passeName + ".refid"];
                    delete formData[passeName + ".degre"];
                }

                // Initialize the sciences of the current periode of the actor
                // For each science of the periode of the actor
                // -----------------------------------------
                const sciences = [];
                for (let s of p.sciences) {

                    // Retrieve the science defined in the formData
                    const scienceName = periodeName + ".sciences.[" + s.refid + "]";
                    sciences.push({
                        refid: formData[scienceName + ".refid"],
                        ref: formData[scienceName + ".ref"],
                        degre: formData[scienceName + ".degre"] });
                    delete formData[scienceName + ".refid"];
                    delete formData[scienceName + ".ref"];
                    delete formData[scienceName + ".degre"];
                }

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

        // Sorts
        // --------------------------------------------------------------------
        let size = this.actor.data.data.magie.sorts.length;
        let sorts = [];
        if (formData.hasOwnProperty("data.page.magie")) {
            for (let index = 0; index < size; index++) {
                const name = "data.magie.sorts.[" + index + "]";
                sorts.push({
                    refid: formData[name + ".refid"],
                    appris: formData[name + ".appris"],
                    tatoue: formData[name + ".tatoue"] });
                delete formData[name + ".refid"];
                delete formData[name + ".appris"];
                delete formData[name + ".tatoue"];
            }
        } else {
            sorts = this.actor.data.data.magie.sorts;
        }
        formData["data.magie.sorts"] = sorts;

        // Invocations
        // --------------------------------------------------------------------
        size = this.actor.data.data.kabbale.invocations.length;
        let invocations = [];
        if (formData.hasOwnProperty("data.page.kabbale")) {
            for (let index = 0; index < size; index++) {
                const name = "data.kabbale.invocations.[" + index + "]";
                invocations.push({
                    refid:  formData[name + ".refid"],
                    appris: formData[name + ".appris"],
                    tatoue: formData[name + ".tatoue"],
                    pacte:  formData[name + ".pacte"],
                    feal:   formData[name + ".feal"],
                    allie:  formData[name + ".allie"]
                });
                delete formData[name + ".refid"];
                delete formData[name + ".appris"];
                delete formData[name + ".tatoue"];
                delete formData[name + ".pacte"];
                delete formData[name + ".feal"];
                delete formData[name + ".allie"];
            }
        } else {
            invocations = this.actor.data.data.kabbale.invocations;
        }
        formData["data.kabbale.invocations"] = invocations;

        // Formules
        // --------------------------------------------------------------------
        size = this.actor.data.data.alchimie.formules.length;
        let formules = [];
        if (formData.hasOwnProperty("data.page.alchimie")) {
            for (let index = 0; index < size; index++) {
                const name = "data.alchimie.formules.[" + index + "]";
                formules.push({
                    refid:      formData[name + ".refid"],
                    appris:     formData[name + ".appris"],
                    tatoue:     formData[name + ".tatoue"],
                    quantite:   formData[name + ".quantite"],
                    transporte: formData[name + ".transporte"]
                });
                delete formData[name + ".refid"];
                delete formData[name + ".appris"];
                delete formData[name + ".tatoue"];
                delete formData[name + ".quantite"];
                delete formData[name + ".transporte"];
            }
        } else {
            formules = this.actor.data.data.alchimie.formules;
        }
        formData["data.alchimie.formules"] = formules;

        // Ordonnance
        // --------------------------------------------------------------------
        size = this.actor.data.data.kabbale.voie.ordonnances.length;
        let ordonnances = [];
        if (formData.hasOwnProperty("data.page.kabbale")) {
            for (let index = 0; index < size; index++) {
                const name = "data.kabbale.voie.ordonnances.[" + index + "]";
                ordonnances.push({ 
                    refid: formData[name + ".refid"],
                    suivi: formData[name + ".suivi"]
                });
                delete formData[name + ".refid"];
                delete formData[name + ".suivi"];
            }
        } else {
            ordonnances = this.actor.data.data.kabbale.voie.ordonnances;
        }
        formData["data.kabbale.voie.ordonnances"] = ordonnances;

        // Materiae Primae
        // --------------------------------------------------------------------
        size = this.actor.data.data.alchimie.materiae.length;
        let materiae = [];
        if (formData.hasOwnProperty("data.page.laboratoire")) {
            for (let index = 0; index < size; index++) {
                const name = "data.alchimie.materiae.[" + index + "]";
                materiae.push({ 
                    refid: formData[name + ".refid"],
                    quantite: formData[name + ".quantite"]
                });
                delete formData[name + ".refid"];
                delete formData[name + ".quantite"];
            }
        } else {
            materiae = this.actor.data.data.alchimie.materiae;
        }
        formData["data.alchimie.materiae"] = materiae;

        // Catalyseur
        // --------------------------------------------------------------------
        size = this.actor.data.data.alchimie.catalyseurs.length;
        let catalyseurs = [];
        if (formData.hasOwnProperty("data.page.laboratoire")) {
            for (let index = 0; index < size; index++) {
                const name = "data.alchimie.catalyseurs.[" + index + "]";
                catalyseurs.push({ 
                    refid: formData[name + ".refid"]
                });
                delete formData[name + ".refid"];
            }
        } else {
            catalyseurs = this.actor.data.data.alchimie.catalyseurs;
        }
        formData["data.alchimie.catalyseurs"] = catalyseurs;

        // Aspects
        // --------------------------------------------------------------------
        size = this.actor.data.data.imago.aspects.length;
        let aspects = [];
        if (formData.hasOwnProperty("data.page.selenim")) {
            for (let index = 0; index < size; index++) {
                const name = "data.imago.aspects.[" + index + "]";
                aspects.push({
                    refid: formData[name + ".refid"],
                    active: formData[name + ".active"] });
                delete formData[name + ".refid"];
                delete formData[name + ".active"];
            }
        } else {
            aspects = this.actor.data.data.imago.aspects;
        }
        formData["data.imago.aspects"] = aspects;

        // Appels
        // --------------------------------------------------------------------
        size = this.actor.data.data.conjuration.appels.length;
        let appels = [];
        if (formData.hasOwnProperty("data.page.conjuration")) {
            for (let index = 0; index < size; index++) {
                const name = "data.conjuration.appels.[" + index + "]";
                appels.push({
                    refid: formData[name + ".refid"],
                    appris: formData[name + ".appris"] });
                delete formData[name + ".refid"];
                delete formData[name + ".appris"];
            }
        } else {
            appels = this.actor.data.data.conjuration.appels;
        }
        formData["data.conjuration.appels"] = appels;

        // Rites
        // --------------------------------------------------------------------
        size = this.actor.data.data.necromancie.rites.length;
        let rites = [];
        if (formData.hasOwnProperty("data.page.necromancie")) {
            for (let index = 0; index < size; index++) {
                const name = "data.necromancie.rites.[" + index + "]";
                rites.push({
                    refid: formData[name + ".refid"],
                    appris: formData[name + ".appris"] });
                delete formData[name + ".refid"];
                delete formData[name + ".appris"];
            }
        } else {
            rites = this.actor.data.data.necromancie.rites;
        }
        formData["data.necromancie.rites"] = rites;

        // Update
        // --------------------------------------------------------------------
        super._updateObject(event, formData);

    }

    /**
     * This function catches the deletion of a ordonnance from the list of materiae primae.
     */

     async _onDeleteImago(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        deleteItemOf(this.actor, "imago", "refid", id, "aspects");
    }

    async _onDeleteConjuration(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        deleteItemOf(this.actor, "conjuration", "refid", id, "appels");
    }

    async _onDeleteNecromancie(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        deleteItemOf(this.actor, "necromancie", "refid", id, "rites");
    }

    async _onDeleteMagie(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        deleteItemOf(this.actor, "magie", "refid", id, "sorts");
    }

    async _onDeleteKabbale(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const type = li.data("item-type");
        if (type === 'invocation') {
            deleteItemOf(this.actor, "kabbale", "refid", id, "invocations");
        } else if (type === 'ordonnance') {
            deleteItemOf(this.actor, "kabbale", "refid", id, "voie.ordonnances")
        }
    }

    async _onDeleteAlchimie(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        deleteItemOf(this.actor, "alchimie", "refid", id, "formules");
    }

    async _onDeleteLaboratoire(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const type = li.data("item-type");
        if (type === 'materiae') {
            deleteItemOf(this.actor, "alchimie", "refid", id, "materiae")
        } else if (type === 'catalyseur') {
            deleteItemOf(this.actor, "alchimie", "refid", id, "catalyseurs")
        }
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
                    if (type == "vecu") {
                        const data = this.actor.data.data.periodes;
                        const i = data[index].vecus.findIndex(i => (i.refid === id));
                        data[index].vecus.splice(i, 1);
                        await this.actor.update({['data.periodes']: data});
                    } else if (type == "savoir") {
                        await this.deleteItemOfIncarnations(index, "savoirs", id);
                    } else if (type == "quete") {
                        await this.deleteItemOfIncarnations(index, "quetes", id);
                    } else if (type == "arcane") {
                        await this.deleteItemOfIncarnations(index, "arcanes", id);
                    } else if (type == "chute") {
                        await this.deleteItemOfIncarnations(index, "chutes", id);
                    } else if (type == "passe") {
                        await this.deleteItemOfIncarnations(index, "passes", id);
                    } else if (type == "science") {
                        await this.deleteItemOfIncarnations(index, "sciences", id);
                    }
                }
            }
        }
    }

    async deleteItemOfIncarnations(periodeIndex, collection,  id) {
        const data = duplicate(this.actor.data.data.periodes);
        const subdata = getByPath(data[periodeIndex], collection);
        const index = subdata.findIndex(a => a.refid === id);
        getByPath(data[periodeIndex], collection).splice(index, 1);
        await this.actor.update({["data.periodes"]: data});
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
        if (type === 'passe') {
            return await this._onItemRoll(event);
        } else if (id === 'noyau' || id === 'pavane') {
            return await this.actor.rollKa(id);
        }
    }

    async _onSimulacreRoll(event) {
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
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
                if (type == "vecu" || type == "savoir" || type == "quete" || type == "arcane" || type === "chute" || type === "passe") {
                    await this._onEditItem(event);
                }
            }
        }
    }

    async _onShowSort(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");

        if ( li.hasClass("expanded") ) {
            let summary = li.next(".item-summary");
            summary.slideUp(200, () => summary.remove());
          } else {
            const item = CustomHandlebarsHelpers.getItem(id);
            let summary = $(`<li class="item-summary"/>`);
            let properties = $(`<ol/>`);
            properties.append(this._property(this._localizeElement(item.data.data.element), 'NEPH5E.element'));
            properties.append(this._property(item.data.data.degre, 'NEPH5E.degre'));
            properties.append(this._property(item.difficulty(this.actor) + '0%', 'NEPH5E.difficulte'));
            properties.append(this._property(item.data.data.duree, 'NEPH5E.duree'));
            properties.append(this._property(item.data.data.portee, 'NEPH5E.portee'));
            properties.append(this._property(item.data.data.description));
            summary.append(properties);
           li.after(summary.hide());
           summary.slideDown(200);
          }
          li.toggleClass("expanded");


    }

    async _onShowInvocation(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const type = li.data("item-type");
        if (type != 'invocation') {
            return;
        }

        if ( li.hasClass("expanded") ) {
            let summary = li.next(".item-summary");
            summary.slideUp(200, () => summary.remove());
          } else {
            const item = CustomHandlebarsHelpers.getItem(id);
            let summary = $(`<li class="item-summary"/>`);
            let properties = $(`<ol/>`);
            properties.append(this._property(this._localizeElement(item.data.data.element), 'NEPH5E.element'));
            properties.append(this._property(this._localizeMonde(item.data.data.monde), 'NEPH5E.kabbale.monde'));
            properties.append(this._property(item.data.data.degre, 'NEPH5E.degre'));
            properties.append(this._property(item.difficulty(this.actor) + '0%', 'NEPH5E.difficulte'));
            properties.append(this._property(item.data.data.duree, 'NEPH5E.duree'));
            properties.append(this._property(item.data.data.portee, 'NEPH5E.portee'));
            properties.append(this._property(item.data.data.description));
            summary.append(properties);
           li.after(summary.hide());
           summary.slideDown(200);
          }
          li.toggleClass("expanded");

    }

    async _onShowFormule(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");

        if ( li.hasClass("expanded") ) {
            let summary = li.next(".item-summary");
            summary.slideUp(200, () => summary.remove());
          } else {
            const item = CustomHandlebarsHelpers.getItem(id);
            let summary = $(`<li class="item-summary"/>`);
            let properties = $(`<ol/>`);
            properties.append(this._property(item.data.data.enonce, 'NEPH5E.alchimie.enonce'));
            properties.append(this._property(this._localizeElement(item.data.data.elements[0]), 'NEPH5E.element'));
            if (item.data.data.cercle === 'oeuvreAuBlanc') {
                properties.append(this._property(this._localizeElement(item.data.data.elements[1]), 'NEPH5E.element'));
            }
            properties.append(this._property(this._localizeSubstance(item.data.data.substance), 'NEPH5E.alchimie.substance'));
            properties.append(this._property(item.data.data.degre, 'NEPH5E.degre'));
            properties.append(this._property(item.difficulty(this.actor) + '0%', 'NEPH5E.difficulte'));
            properties.append(this._property(item.data.data.duree, 'NEPH5E.duree'));
            properties.append(this._property(item.data.data.aire, 'NEPH5E.aire'));
            properties.append(this._property(item.data.data.description));
            summary.append(properties);
           li.after(summary.hide());
           summary.slideDown(200);
          }
          li.toggleClass("expanded");


    }

    async _onShowAspect(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const type = li.data("item-type");
        if (type === 'aspect') {
            if ( li.hasClass("expanded") ) {
                let summary = li.next(".item-summary");
                summary.slideUp(200, () => summary.remove());
            } else {
                const item = CustomHandlebarsHelpers.getItem(id);
                let summary = $(`<li class="item-summary"/>`);
                let properties = $(`<ol/>`);
                properties.append(this._property(item.data.data.degre, 'NEPH5E.construction'));
                properties.append(this._property(item.data.data.activation, 'NEPH5E.cout'));
                properties.append(this._property(item.data.data.duree, 'NEPH5E.duree'));
                properties.append(this._property(item.data.data.description));
                summary.append(properties);
                li.after(summary.hide());
                summary.slideDown(200);
            }
            li.toggleClass("expanded");
        } else if (type === 'passe') {
            if ( li.hasClass("expanded") ) {
                let summary = li.next(".item-summary");
                summary.slideUp(200, () => summary.remove());
            } else {
                const item = CustomHandlebarsHelpers.getItem(id);
                let summary = $(`<li class="item-summary"/>`);
                let properties = $(`<ol/>`);
                properties.append(this._property(item.data.data.description));
                summary.append(properties);
                li.after(summary.hide());
                summary.slideDown(200);
            }
            li.toggleClass("expanded");
        }
    }

    async _onShowRite(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const type = li.data("item-type");
        if (type != 'rite') {
            return;
        }
        if ( li.hasClass("expanded") ) {
            let summary = li.next(".item-summary");
            summary.slideUp(200, () => summary.remove());
        } else {
            const item = CustomHandlebarsHelpers.getItem(id);
            let summary = $(`<li class="item-summary"/>`);
            let properties = $(`<ol/>`);
            properties.append(this._property(this._localizeDesmos(item.data.data.desmos), 'NEPH5E.necromancie.desmos.nom'));
            properties.append(this._property(item.difficulty(this.actor) + '0%', 'NEPH5E.difficulte'));
            properties.append(this._property(item.data.data.degre, 'NEPH5E.cout'));
            properties.append(this._property(item.data.data.duree, 'NEPH5E.duree'));
            properties.append(this._property(item.data.data.description));
            summary.append(properties);
           li.after(summary.hide());
           summary.slideDown(200);
        }
        li.toggleClass("expanded");
    }

    async _onShowAppel(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const type = li.data("item-type");
        if (type != 'appel') {
            return;
        }
        if ( li.hasClass("expanded") ) {
            let summary = li.next(".item-summary");
            summary.slideUp(200, () => summary.remove());
          } else {
            const item = CustomHandlebarsHelpers.getItem(id);
            let summary = $(`<li class="item-summary"/>`);
            let properties = $(`<ol/>`);
            properties.append(this._property(this._localizeAppel(item.data.data.appel), 'NEPH5E.conjuration.appel'));
            properties.append(this._property(item.difficulty(this.actor) + '0%', 'NEPH5E.difficulte'));
            properties.append(this._property(item.data.data.degre, 'NEPH5E.degre'));
            properties.append(this._property((item.data.data.controle?"Oui":"Non"), 'NEPH5E.controle'));
            properties.append(this._property(item.data.data.visibilite, 'NEPH5E.visibilite'));
            properties.append(this._property(item.data.data.entropie, 'NEPH5E.entropie'));
            properties.append(this._property(item.data.data.dommages, 'NEPH5E.dommages'));
            properties.append(this._property(item.data.data.protection, 'NEPH5E.protection'));
            properties.append(this._property(item.data.data.description));
            summary.append(properties);
           li.after(summary.hide());
           summary.slideDown(200);
          }
          li.toggleClass("expanded");

    }

    _localizeElement(element) {
        const name = 'NEPH5E.' + element;
        return game.i18n.localize(name);
    }

    _localizeMagie(cercle) {
        const name = 'NEPH5E.magie.cercles.' + cercle;
        return game.i18n.localize(name);
    }

    _localizeAlchimie(cercle) {
        const name = 'NEPH5E.alchimie.cercles.' + cercle;
        return game.i18n.localize(name);
    }

    _localizeSubstance(substance) {
        const name = 'NEPH5E.alchimie.substances.' + substance;
        return game.i18n.localize(name);
    }

    _localizeSephirah(sephirah) {
        const name = 'NEPH5E.kabbale.sephiroth.' + sephirah;
        return game.i18n.localize(name);
    }

    _localizeMonde(monde) {
        const name = 'NEPH5E.kabbale.mondes.' + monde;
        return game.i18n.localize(name);
    }

    _localizeDesmos(desmos) {
        const name = 'NEPH5E.necromancie.desmos.' + desmos;
        return game.i18n.localize(name);
    }

    _localizeAppel(appel) {
        const name = 'NEPH5E.conjuration.appels.' + appel;
        return game.i18n.localize(name);
    }

    _property(value, name = null) {
        const property = $(`<li class="item-property">`);
        if (name) {
            property.append($(`<span class="item-property-name">` + game.i18n.localize(name) + `</span>`));
        }
        property.append($(`<span class="item-property-value">` + value + `</span>`));
        return property;
    }

    /**
     * @return the periode of the specified vecu.
     */
    periodeOf(id) {
        return game.items.find(function (item) {
            return item.data.type === 'periode' && item.data.data.vecus.findIndex(vecu => (vecu.refid === id)) != -1;
        });
    }

    /**
     * Periode: item
     * Vecu: id
     */
    hasVecu(periode, id) {
        return periode.data.data.vecus.findIndex(vecu => (vecu.refid === id)) != -1;
    }

    numberOfVecu() {
        let size = 0;
        for (let periode of this.actor.data.data.periodes) {
            size = size + periode.vecus.length;
        }
        return size;
    }

    getItem(id) {
        return game.items.find(function (item) { return item.data.data.id === id });
    }

}