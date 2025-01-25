import { ActiveEffects } from "../../feature/core/effects.js";
import { Arcane } from "../../feature/periode/arcane.js";
import { Aspect } from "../../feature/selenim/aspect.js";
import { Capacite } from "../../feature/periode/capacite.js";
import { Catalyseur } from "../../feature/alchimie/catalyseur.js";
import { Chute } from "../../feature/periode/chute.js";
import { Competence } from "../../feature/periode/competence.js";
import { Constants } from "../common/constants.js";
import { Distance } from "../../feature/combat/core/distance.js";
import { FeatureBuilder } from "../../feature/core/featureBuilder.js";
import { Fraternite } from "../../feature/fraternite/fraternite.js";
import { Game } from "../common/game.js";
import { HistoricalFeature } from "../../feature/core/historicalFeature.js";
import { Laboratoire } from "../../feature/alchimie/laboratoire.js";
import { Materiae } from "../../feature/alchimie/materiae.js";
import { Metamorphe } from "../../feature/nephilim/metamorphe.js";
import { Melee } from "../../feature/combat/core/melee.js";
import { Naturelle } from "../../feature/combat/core/naturelle.js";
import { Ordonnance } from "../../feature/kabbale/ordonnance.js";
import { Periode } from "../../feature/periode/periode.js";
import { Savoir } from "../../feature/periode/savoir.js";
import { Science } from "../../feature/science/science.js";
import { Vecu } from "../../feature/periode/vecu.js";
import { Wrestle } from "../../feature/combat/core/wrestle.js";

export class NephilimActor extends Actor {

    /**
     * @returns the system identifier.
     */
    get sid() {
        return this?.system?.id;
    }

    /**
     * @returns true if the actor is desoriente.
     */
    get desoriente() {
        return ActiveEffects.isActive(this, ActiveEffects.DESORIENTE);
    }
    
    /**
     * @returns true if the actor is immobilise.
     */
    get immobilise() {
        return ActiveEffects.isActive(this, ActiveEffects.IMMOBILISE);
    }

    /**
     * @returns true if the actor is projete.
     */
    get projete() {
        return ActiveEffects.isActive(this, ActiveEffects.PROJETE);
    }

    /**
     * @returns the simulacre as actor object, undefined if not exist.
     */
    get simulacre() {
        return game.actors.find(a => a.sid === this.system.simulacre);
    }

    /**
     * @returns the actor damage bonus.
     */
    get dommage() {
        if (this.type === 'figure') {
            if (this.system?.options?.nephilim === true) {
                return Math.floor(this.system.ka.feu / 5);
            } else if (this.system?.options?.selenim === true) {
                return Math.floor(this.system.ka.noyau / 10);
            } else {
                return this.system?.ka.soleil ?? 0;
            }
        } else {
            return 0;
        }
    }

    /**
     * @returns the actor mouvement.
     */
    get mouvement() {
        switch (this.type) {
            case 'figure':
                if (this.system.options?.nephilim === true) {
                    return this.system.ka.eau * 2;
                }
                if (this.system.options?.selenim === true) {
                    return this.system.ka.noyau;
                }
                return this.system.ka.soleil ?? 0;
            case 'figurant':
            default:
                return 0;
        }
    }

    /**
     * @returns the actor perspicacite.
     */
    get perspicacite() {
        switch (this.type) {
            case 'figure':
                if (this.system.options?.nephilim === true) {
                    return 11 - this.system.ka.air;
                }
                if (this.system.options?.selenim === true) {
                    return 11 - this.system.ka.noyau;
                }
                return 11 - (this.system.ka.soleil ?? 0);
            case 'figurant':
            default:
                return 0;
        }
    }

    /**
     * @returns the actor recuperation.
     */
    get recuperation() {
        switch (this.type) {
            case 'figure':
                if (this.system.options?.nephilim === true) {
                    return 11 - this.system.ka.terre;
                }
                if (this.system.options?.selenim === true) {
                    return 11 - this.system.ka.noyau;
                }
                return 11 - this.system.soleil;
            case 'figurant':
            default:
                return 0;
        }
    }

    /**
     * @returns the actor voile.
     */
    get voile() {
        switch (this.type) {
            case 'figure':
                if (this.system.options?.nephilim === true) {
                    return Math.floor(this.system.ka.lune / 5);
                }
                if (this.system.options?.selenim === true) {
                    return Math.floor(this.system.ka.noyau / 10);
                }
                return Math.floor((this.system.ka.soleil ?? 0) / 10);
            case 'figurant':
            default:
                return 0;
        }
    }

    /**
     * @return the initiative.
     */
    get initiative() {
         switch (this.type) {
             case 'figure':
                if (this.system.options?.nephilim === true) {
                    return this.system.ka.eau * 2;
                }
                if (this.system.options?.selenim === true) {
                    return this.system.ka.noyau;
                }
                for (let elt of ['soleil', 'orichalque', 'brume', 'air', 'feu', 'lune', 'terre']) {
                    const val = this.system.ka[elt];
                    if (val !== undefined) {
                        return val;
                    }
                }
            case 'figurant':
                return this.system.menace;
            default:
                return 0;
         }
    }

    /**
     * @returns the actor ka dominant.
     */
    get ka() {
        switch (this.type) {
            case 'figure':
                if (this.system.options?.nephilim === true) {
                    return Math.max(
                        this.system.ka.air,
                        this.system.ka.eau,
                        this.system.ka.feu,
                        this.system.ka.lune,
                        this.system.ka.terre);
                }
                if (this.system.options?.selenim === true) {
                    return this.system.ka.noyau;
                }
                return 0;
            case 'figurant':
                return this.system.ka;
            default:
                return 0;
        }
    }

    /**
     * @returns the voie magique of the actor.
     */
    get voieMagique() {
        return this.items.find(i => i.type === 'magie');
    }

    /**
     * @returns the voie alchimique of the actor.
     */
    get voieAlchimique() {
        return this.items.find(i => i.type === 'alchimie');
    }

    /**
     * @returns true if lutte manoeuver is available for the actor. 
     */
    get isLutteAvailable() {
        return this.type !== 'figure' || this.system.manoeuvres.lutte != null;
    }

    /**
     * @returns true if the lutte manoeuver can be performed.
     */
    get lutteCanBePerformed() {
        if (this.isLutteAvailable === false) {
            return false;
        }
        if (this.tokenOf == null) {
            return true;
        }
        if (this.immobilise) {
            return true;
        }
        return this.target != null;
    }

    /**
     * @returns the data to display. 
     */
    get lutte() {
        if (this.type !== 'figure') {
            return "";
        }
        const sid = this.system.manoeuvres.lutte;
        if (sid == null) {
            return "";
        } else {
            const item = game.items.find(i => i.sid === sid);
            return item == null ? 'System Error' : item.name; 
        }
    }

    /**
     * @returns true if esquive manoeuver is available for the actor. 
     */
    get isEsquiveAvailable() {
        return this.type !== 'figure' || this.system.manoeuvres.esquive != null;
    }

    /**
     * @returns the data to display. 
     */
    get esquive() {
        if (this.type !== 'figure') {
            return "";
        }
        const sid = this.system.manoeuvres.esquive;
        if (sid == null) {
            return "";
        } else {
            const item = game.items.find(i => i.sid === sid);
            return item == null ? 'System Error' : item.name; 
        }
    }

    /**
     * @returns the data to display. 
     */
    get arcanes() {
        return Arcane.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get capacites() {
        return Capacite.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get catalyseurs() {
        return Catalyseur.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get chutes() {
        return new HistoricalFeature(this).getAll('chute');
    }

    /**
     * @returns the current chute
     */
    get khaiba() {
        return Chute.getKhaiba(this);
    }

    /**
     * @returns the current chute
     */
    get narcose() {
        return Chute.getNarcose(this);
    }

    /**
     * @returns the current chute
     */
    get ombre() {
        return Chute.getOmbre(this);
    }

    /**
     * @returns the current chute
     */
    get luneNoire() {
        return Chute.getLuneNoire(this);
    }

    /**
     * @returns the data to display. 
     */
    get competences() {
        return Competence.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get imago() {
        return Aspect.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get metamorphe() {
        return Metamorphe.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get ordonnances() {
        return Ordonnance.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get materiae() {
        return Materiae.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get passes() {
        return new HistoricalFeature(this).getAll('passe');
    }

    /**
     * @returns the data to display. 
     */
    get periodes() {
        return Periode.getAll(this);
    }

    /**
     * @returns the name of the current periode.
     */
    get currentPeriode() {
        if (this.system.periode == null) {
            return "Aucune periode courante";
        }
        const periode = game.items.find(i => i.sid === this.system.periode);
        return periode == null ? "Periode non trouvee" : periode.name;
    }

    /**
     * @returns the data to display. 
     */
    get quetes() {
        return new HistoricalFeature(this).getAll('quete');
    }

    /**
     * @returns the data to display. 
     */
    get savoirs() {
        return new HistoricalFeature(this).getAll('savoir');
    }

    /**
     * @returns the data to display. 
     */
    get sciences() {
        return new HistoricalFeature(this).getAll('science');
    }

    /**
     * @returns the data to display. 
     */
    get vecusOfActor() {
        return Vecu.getAll(this, 'actor');
    }

    /**
     * @returns the data to display. 
     */
    get vecusOfSimulacre() {
        return Vecu.getAll(this, 'simulacre');
    }

    /**
     * @param sid The system identifier of the item for which to retrieve the degre of the fraternite.
     * @returns the fraternite degre for the specified item.
     */
    fraternite(sid) {
        let degre = 0;
        if (this.system?.options?.fraternites === true) {
            for (let f of this.fraternites.filter(a => a.system.options.active === true)) {
                const d = new FeatureBuilder(f).withOriginalItem(sid).create().degre;
                if (d != null && d > degre) {
                    degre = d;
                }
            }
        }
        return degre;
    }

    /**
     * @returns the only targeted token identifier. 
     */
    get target() {
        const targets = Array.from(game.user.targets);
        return targets.length === 0 || targets.length > 1 ? null : targets[0];
    }

    /**
     * @returns the token of the actor on the scene, null if none
     */
    get tokenOf() {
        if (this.token != null) {
            return this.token;
        }
        return canvas.tokens?.objects?.children.find(t => t.actor.id === this.id);
    }

    /**
     * @param science The name of the science.
     * @returns true if some focus are owned.
     */
    numberOfFocus(science) {
        return this.focus(science).length;
    }

    /**
     * @param science The key of the science.
     * @returns the level of the science.
     */
    science(science) {
        const i = Science.getScience(science);
        return new Science(this).withItem(i).degre;
    }

    /**
     * @param savoir The key of the savoir.
     * @returns the level of the savoir.
     */
    savoir(savoir) {

        let item = null;
        switch (savoir) {
            case "denier": {
                item = game.items.find(i => i.sid === "2e59bafc-c15ad33f-ecf2b0b5-552ae23e");
                break;
            }
            case "coupe": {
                item = game.items.find(i => i.sid === "1ca3f53b-b487e304-2260922e-b9d29476");
                break;
            }
            case "epee": {
                item = game.items.find(i => i.sid === "6d3727df-99a5a34a-cd599572-c9d755dd");
                break;
            }
            case "baton": {
                item = game.items.find(i => i.sid === "83a3e42e-5af77cbd-df0f4d7c-38dd775d");
                break;
            }
            case "bohemien": {
                item = game.items.find(i => i.sid === "0168fa19-a6141d9e-65eaa5b4-d6e9dcb1");
                break;
            }
        }

        return item == null ? null : new Savoir(this).withItem(item);

    }

    /**
     * @param science The type 'sort', 'formule' etc...
     * @param options The option parameters:
     *   - all: if true, all cercles are returned.
     * @returns the information datas about the specified cercles.
     */
    cercles(science, options) {
        return Science.cercles(this, science, options);
    }

    /**
     * @param science The name of the science.
     * @returns the owned focus of the actor. 
     */
    focus(science) {
        return Science.getFocus(this, science);
    }

    /**
     * @returns the actor laboratories.
     */
    get laboratoires() {
        return Laboratoire.getAll(this);
    }

    /**
     * @returns the fraternites objects in which the actor is member.
     */
    get fraternites() {
        const fraternites = [];
        for (let f of game.actors.filter(a => a.type === 'fraternite')) {
            if (new Fraternite(f).isActiveMember(this)) {
                fraternites.push(f);
            }
        }
        return fraternites;
    }

    /**
     * @returns the members of the fraternite sorted by status.
     */
    get membres() {
        return new Fraternite(this).membres();
    }

    /**
     * @param actor   The actor identifier.
     * @param periode The periode system identifier.
     * @returns true if new member for the periode (in), false is out
     */
    isNewMember(actor, periode) {
        return new Fraternite(this).isNewMember(actor, periode);
    }

    /**
     * @param type The type of dammages, 'physique', or 'magique'.
     * @returns the protection against the specified type of dammage according to
     * the armor if exists and the optional bonus.
     */
    protection(type) {

        // Initialization
        let protection = this.system.bonus.protection;

        // Add the armor if exists
        const armor = this.items.find(i => i.type === "armure" && i.system.used === true);
        if (armor != null) {
            protection = protection + armor.system[type];
        }

        return protection;
    }

    get locked() {
        return this.system.options.locked;
    }

    /**
     * Create the specified feature.
     * @param type The type of macro which can be 
     *   - ka      with id in [air, eau, feu, lune, terre, soleil, ka]
     *   - item    with sid
     *   - wrestle without id or sid
     *   - 
     * 
     *   - chute
     *   - competence
     *   - ka 
     *      * element [air, eau, feu, lune, terre, soleil, ka]
     *   - noyau
     *   - passe
     *   - pavane
     *   - quete
     *   - savoir
     *   - science
     *   - vecu
     * @param id  The object identifier
     * @param sid The object system identifier.
     * @returns the instance.
     */
    async processMacro(type, id, sid) {
        let builder = null;
        switch (type) {

            case 'item': {
                builder = new FeatureBuilder(this)
                    .withOriginalItem(sid)
                    .withScope('actor')
                    .withPeriode(this.system.periode);
                break;
            }

            case 'vecu': {
                builder = new FeatureBuilder(this)
                    .withEmbeddedItem(id)
                    .withScope(this.items.get(id) != null ? 'actor' : 'simulacre')
                    .withPeriode(this.system.periode);
                break;
            }

            case 'ka': {
                builder = new FeatureBuilder(this)
                    .withKa(id)
                    .withScope('actor');
                break;
            }

            case 'noyau': {
                builder = new FeatureBuilder(this)
                    .withNoyau();
                break;
            }

            case 'pavane': {
                builder = new FeatureBuilder(this)
                    .withPavane();
                break;
            }

            case 'weapon': {

                const weapon = this.items.get(id);

                if (weapon == null) {
                    ui.notifications.warn("Vous ne possédez pas cette d'arme pour attaquer.");
                    return;
                }

                if (weapon.attackAvailable === false) {
                    ui.notifications.warn("Vous ne pouvez pas attaquer avec cette arme.");
                    return;
                }

                switch (weapon.system.type) {
                    case Constants.NATURELLE:
                        await new Naturelle(this, weapon).initializeRoll();
                        break;
                    case Constants.MELEE:
                        await new Melee(this, weapon).initializeRoll();
                        break;
                    case Constants.FEU:
                    case Constants.TRAIT:
                        await new Distance(this, weapon).initializeRoll();
                        break;
                }

                break;

            }

            case 'wrestle': {
                if (this.lutteCanBePerformed) {
                    await new Wrestle(this).initializeRoll();
                }
                break;
            }

        }

        if (builder != null) {
            const feature = builder.create();
            if (feature != null) {
                await feature.initializeRoll();
            }
        }

    }

    async updateEffect(id) {
        await ActiveEffects.toggle(this, ActiveEffects.get(id));
    }

    async activateEffect(id) {
        await ActiveEffects.activate(this, ActiveEffects.get(id));
    }

    async deactivateEffect(id) {
        await ActiveEffects.deactivate(this, ActiveEffects.get(id));
    }

    /**
     * Toggle the usage of the specified equipment item.
     * States are not used --> attack --> parade --> not used
     * @param item The item for which to toggle the usage.
     */
    async toggleEquipmentUsage(item) {

        if (item == null) {
            return;
        }

        const used = item.system.used;

        switch (item.type) {

            case 'armure':
                await item.update({ ['system.used']: !used });
                break;

            case 'arme':
                if (item.system.type === 'melee') {
                    const parade = item.system.parade;
                    
                    // Not used to attack weapon
                    if (used === false) {
                        await item.update({ ['system.used']: true });
                        await item.update({ ['system.parade']: false });

                    // Attack weapon to parade weapon
                    } else if (parade === false) {
                            await item.update({ ['system.used']: true });
                            for (let arme of this.items.filter(i => i.type === 'arme' && i.id !== item.id)) {
                                await arme.update({ ['system.parade']: false });
                            }
                            await item.update({ ['system.parade']: true });

                    // Parade weapon to not used
                    } else {
                        await item.update({ ['system.used']: false });
                        await item.update({ ['system.parade']: false });
                        
                    }

                } else {
                    await item.update({ ['system.used']: !used });
                }
                break;

        }

    }

    /**
     * @returns all embedded weapons sorted by type.
     */
    get weapons() {
        const equipments = {naturelle: [], melee: [], trait: [], feu: [] };
        for (let item of this.items.filter(i => i.type === 'arme')) {
            equipments[item.system.type].push(item);
        }
        return equipments;
    }

    /**
     * @returns all embedded armors .
     */
    get armors() {
        return this.items.filter(i => i.type === 'armure');
    }

    // ----------------------------------------------------------------------------------------------

    /**
     * @param element The element for which to retrieve to max MP.
     * @returns the maximum number of materiae primae.
     */
    getMaxBaseMP(element) {
        return new Laboratoire(this).getMaxBaseMP(element);
    }

    /**
     * Gets the construct associated with the specified substance.
     * @param substance The substance of the construct to get.
     * @return the construct.
     */
    getConstruct(substance) {
        return new Laboratoire(this).getConstruct(substance);
    }

    /**
     * @returns the allowed approches with the name of the element and the value if > 0.
     */
    approches() {
        const approches = {};
        approches['none'] = {
            name: 'NEPH5E.none',
            label: 'Aucune approche',
            degre: 0
        };
        switch (this.type) {
            case 'figure':
                if (this.system.options.selenim === true) {
                    if (this.system.ka.noyau > 0) {
                        approches['noyau'] = {
                            name: 'NEPH5E.luneNoire',
                            label: 'Approche de ' + game.i18n.localize('NEPH5E.luneNoire'),
                            degre: this.system.ka.noyau
                        };
                    }
                }
                if (this.system.options.nephilim === true) {
                    for (let elt of ['air', 'eau', 'feu', 'lune', 'terre']) {
                        const value = this.system.ka[elt];
                        if (value > 0) {
                            approches[elt] = {
                                name: 'NEPH5E.pentacle.elements.' + elt,
                                label: 'Approche de ' + game.i18n.localize('NEPH5E.pentacle.elements.' + elt),
                                degre: value
                            };
                        }
                    }
                }
                break;
            case 'figurant':
                approches['ka'] = {
                    name: 'NEPH5E.ka',
                    label: 'Approche de ' + game.i18n.localize('NEPH5E.ka'),
                    degre: this.system.ka
                };
                break;
        }
        return approches;
    }

    /**
     * Gets the level of the specified ka.
     * @param element The element of the ka to get. Allowed ka are:
     *   air,
     *   brume,
     *   eau,
     *   feu,
     *   lune,
     *   noyau,
     *   orichalque,
     *   reserve,
     *   soleil,
     *   terre
     * @returns the level of the specified ka.
     */
    getKa(element) {
        switch (this.type) {
            case 'figure':
                return this.system.ka[element] ?? 0;
            case 'figurant':
                return this.system.ka;
        }
    }

    /**
     * @param type The type of wounds to take into account, physical or magical.
     * @returns the wounds modifier.
     */
    getWoundsModifier(type) {
        let modifier = 0;
        const baseDommage = type === Constants.PHYSICAL ? this.system.dommage.physique : this.system.dommage.magique;
        for (const w in Game.wounds) {
            const wound = Game.wounds[w];
            if (baseDommage[wound.id]) {
                modifier = modifier + wound.modifier;
            }
        }
        return modifier;
    }

    get physicalModifier() {
        return this.getWoundsModifier(Constants.PHYSICAL);
    }

    get magicalModifier() {
        return this.getWoundsModifier(Constants.MAGICAL);
    }

    getSentence(quality, self) {
        return self ? game.i18n.localize('NEPH5E.tente.self.' + quality) : game.i18n.localize('NEPH5E.tente.simulacre.' + quality);
    }

    /**
     * Deletes the specified embedded item.
     * @param item The embedded item to delete.
     */
    async deleteEmbeddedItem(item) {
        if (item != null) {
            switch (item.type) {
                case 'periode':
                    await this.deletePeriode(item.sid);
                    break;
                case 'vecu':
                    await this.deleteVecu(item);
                    break;
                case 'competence':
                    await this.deleteCompetence(item);
                    break;
                default:
                    await this.deleteEmbeddedDocuments('Item', [item.id]);
                    break;
            }
        }
    }

    /**
     * Deletes the specified vecu, used as callback.
     * @param item The original or embedded vecu item to delete.
     */
    async deleteVecu(item) {
        const embedded = this.items.find(i => i.sid === item.sid);
        if (embedded != null) {
            await new Vecu(this, 'actor').withItem(embedded).delete();
        }
    }

    /**
     * Deletes the specified competence, used as callback.
     * @param item The competence item object to delete.
     */
    async deleteCompetence(item) {
        await new Competence(this, item).delete();
    }   

    /**
     * @param sid The system identifier of the periode to delete.
     */
    async deletePeriode(sid) {
        const original = game.items.find(i => i.sid === sid);
        if (original != null) {
            await new Periode(this, original).delete();
        }
    }
 
    /**
     * @param sid The system identifier of current periode to set.
     */
    async setCurrentPeriode(sid) {
        await this.update({ ["system.periode"]: sid });
    }

    /**
     * @Override
     */
     async _onDelete(options, userId) {

        // On process world actor deletion
        if (this.isEmbedded === true) {
            return;
        }

        for (let actor of game.actors) {
            await this.onDeleteEmbeddedActor(actor);
        }

        for (let scene of game.scenes) {
            for (let token of scene.tokens) {
                if (token.actor != null) {
                    await this.onDeleteEmbeddedActor(token.actor);
                }
            }
        }

        await super._onDelete(options, userId);

    }

    /**
     * Delete the current actor from the specified container actor
     * @param actor The actor for which to delete the current actor object.
     */
    async onDeleteEmbeddedActor(actor) {

        // Remove the current actor if it is a simulacre of a figure
        if (actor.system?.simulacre === this.sid) {
            await actor.update({ ['system.simulacre']: null });
        }

        // Remove the current actor if it is a member of a fraternite
        if (actor.type === 'fraternite') {
            await new Fraternite(actor).onDeleteActor(this);
        }

    }

    /**
     * Render the sheet if opened.
     */
    async render() {
        if (this?.sheet?.rendered === true) {
            await this.sheet.render(true);
        }
    }

}