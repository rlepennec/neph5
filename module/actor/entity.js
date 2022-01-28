import { CustomHandlebarsHelpers } from "../common/handlebars.js";
import { Rolls } from "../common/rolls.js";
import { Game } from "../common/game.js";
import { getByPath } from "../common/tools.js";
import { Strike } from "../combat/melee/strike.js";
import { Fire } from "../combat/ranged/fire.js";
import { Move } from "../combat/maneuver/move.js";
import { Wrestle } from "../combat/unarmed/wrestle.js";
import { Defend } from "../combat/defense/defend.js";

export class NephilimActor extends Actor {

    /**
     * @returns true if combat actions are locked.
     */
    unlocked() {
        return this.locked === undefined ? true : !this.locked;
    }

    /**
     * Locks the combat macros.
     * @returns the instance.
     */
    lock() {
        this.locked = true;
    }

    /**
     * Locks the combat macros.
     * @returns the instance.
     */
    unlock() {
        this.locked = false;
    }

    /**
     * Performs a strike action with the specified weapon.
     * @param token The token of the character which performs the action.
     * @param arme  The weapon item.
     */
    async frapper(token, weapon) {
        if (this.unlocked()) {
            await new Strike(this, token, weapon).doit();
        }
    }

    /**
     * Performs a fire action with the specified weapon.
     * @param token  The token of the character which performs the action.
     * @param weapon The weapon item.
     */
    async tirer(token, weapon) {
        if (this.unlocked()) {
            await new Fire(this, token, weapon).doit();
        }
    }

    /**
     * Performs a wrestle action.
     * @param token The token of the character which performs the action.
     */
    async wrestle(token) {
        if (this.unlocked()) {
            await new Wrestle(this, token).doit();
        }
    }

    /**
     * Performs a move action.
     * @param token The token of the character which performs the action.
     */
    async move(token) {
        if (this.unlocked()) {
            await new Move(this, token).doit();
        }
    }

    /**
     * Executes the related macro.
     * @param token  The token for which to execute the macro.
     * @param event  The identifier of the chat message which has triggered the defense.
     * @param attack The attack which triggers the defense.
     */
    async react(token, event, attack) {
        await new Defend(this, token, event, attack).doit();
    }

    /**
     * Uses the specified item.
     * @param {*} item 
     */
    async useItem(item) {
        const used = item.data.data.used;
        await item.update({ ['data.used']: !used });
    }

    /**
     * Executes the pentacle macro.
     */
    async ka() {
        if (this.unlocked()) {
            await this.rollKa(this.getMajorKa());
        }
    }

    /**
     * Executes the skill macro.
     */
    async skill(uuid) {
        if (this.unlocked()) {
            await CustomHandlebarsHelpers.getItem(uuid).roll(this);
        }
    }

    // ----------------------------------------------------------------------------------------------

    getCompetenceById(id) {
        const competence = CustomHandlebarsHelpers.getItem(id);
        if (this.data.type === "figure") {
            return this.getCompetence(competence);
        } else if (this.data.type = "figurant") {
            return this.getCompetenceOfFigurant();
        } else if (this.data.type === "simulacre") {
            return this.getCompetenceOfSimulacre(competence);
        } else {
            return 0;
        }
    }

    /**
     * @returns the simulacre of the actor.
     */
    getSimulacre() {
        const refId = this.data.data.simulacre.refid;
        return refId === null ? null : CustomHandlebarsHelpers.getActor(refId);
    }

    /**
     * Gets the level og the specified ka for the specified construct.
     * @param substance The substance which defines the construct to get.
     * @param elements  The elements for which to get the ka.
     * @returns the level of the specified ka.
     */
    getKaOfConstruct(substance, elements) {
        const construct = this.getConstruct(substance);
        return elements.length === 1 ? construct[elements[0]] ?? 0 : Math.min(construct[elements[0]] ?? 0, construct[elements[1]] ?? 0);
    }

    /**
     * Gets the construct associated with the specified substance.
     * @param substance The substance of the construct to get.
     * @return the construct.
     */
    getConstruct(substance) {
        const constructs = this.data.data.alchimie.constructs;
        switch (substance) {
            case 'ambre':
                return constructs.cornue;
            case 'liqueur':
                return constructs.alambic;
            case 'metal':
                return constructs.creuset;
            case 'poudre':
                return constructs.athanor;
            case 'vapeur':
                return constructs.aludel;
        }
    }

    /**
     * @returns the major ka element.
     */
    getMajorKa() {
        switch (this.data.type) {
            case 'figure':
                let major = null;
                let degre = 0;
                for (let elt of Object.keys(this.data.data.ka).filter(e => e != 'reserve')) {
                    const value = this.data.data.ka[elt];
                    if (degre <= value) {
                        major = elt;
                        degre = value;
                    }
                }
                return major;
            case 'figurant':
                return 'ka';
            case 'simulacre':
                return 'soleil';
        }
    }

    /**
     * @returns the allowed approches with the name of the element and the value if > 0.
     */
    getApproches() {
        const approches = {};
        approches['none'] = 'NEPH5E.none';
        switch (this.data.type) {
            case 'figure':
                if (this.data.data.ka.noyau > 0) {
                    approches['noyau'] = 'NEPH5E.luneNoire';
                } else {
                    for (let elt of ['air', 'eau', 'feu', 'lune', 'terre']) {
                        const value = this.data.data.ka[elt];
                        if (value > 0) {
                            approches[elt] = 'NEPH5E.pentacle.elements.' + elt;
                        }
                    }
                }
                break;
            case 'figurant':
                approches['ka'] = 'NEPH5E.ka';
                break;
            case 'simulacre':
                approches['soleil'] = 'NEPH5E.soleil';
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
        switch (this.data.type) {
            case 'figure':
                return this.data.data.ka[element] ?? 0;
            case 'figurant':
                return this.data.data.ka;
            case 'simulacre':
                return this.data.data.soleil;
        }

    }

    /**
     * Gets the level of the specified attribute.
     * @param attribute The attribute for which to get the level. Allowed attributes are:
     *   agile,
     *   endurant,
     *   fort,
     *   intelligent,
     *   seduisant,
     *   soleil,
     *   fortune,
     *   savant,
     *   sociable
     * @returns the attribute level or -1 if not found.
     */
    getAttribute(attribute) {
        const simulacre = this.getSimulacre();
        return simulacre === null ? -1 : simulacre.data.data[attribute] ?? -1;
    }

    /**
     * Gets the sum of the level of the specified items for all active periodes.
     * @param items The items of the periodes in which to find. The allowed items are:
     *   quetes,
     *   savoirs,
     *   arcanes,
     *   chutes
     *   passes
     * @param item The item for which to get the sum of the levels.
     * @returns the sum of the levels.
     */
    getSumFrom(items, item) {
        let sum = 0;
        for (let periode of this.data.data.periodes.filter(p => p.active)) {
            for (let it of periode[items].filter(i => i.refid === item.data.data.id)) {
                sum = sum + it.degre;
            }
        }
        return sum;
    }

    /**
     * Gets for each item of the specified items the sums of the level for all active periodes.
     * @param items The items of the periodes in which to find. The allowed items are:
     *   quetes,
     *   savoirs,
     *   arcanes,
     *   chutes,
     *   passes
     * @returns the array of the ordered items.
     */
    getLevelsFrom(items) {
        const sums = [];
        for (let periode of this.data.data.periodes.filter(p => p.active)) {
            for (let item of getByPath(periode, items)) {
                const index = sums.findIndex(i => (i.refid === item.refid));
                if (index === -1) {
                    sums.push({
                        refid: item.refid,
                        name: CustomHandlebarsHelpers.getItem(item.refid).data.name,
                        degre: item.degre,
                        next: CustomHandlebarsHelpers.getNextCost(item.degre + 1)
                    });
                } else {
                    sums[index].degre = sums[index].degre + item.degre;
                    sums[index].next = CustomHandlebarsHelpers.getNextCost(sums[index].degre + 1);
                }
            }
        }
        sums.sort((fst, snd) => (fst.name > snd.name) ? 1 : ((snd.name > fst.name) ? -1 : 0));
        return sums;
    }

    /**
     * Gets the sum  of the level of the specified items for all active periodes.
     * @param name The reference name of the science for which to get the sum of the levels. Allowed names are:
     *   oeuvreAuNoir
     *   basseMagie
     * @returns the sums of the levels.
     */
    getScience(name) {
        let sum = 0;
        for (let periode of this.data.data.periodes.filter(p => p.active)) {
            for (let it of periode.sciences.filter(i => i.ref === name)) {
                sum = sum + it.degre;
            }
        }
        return sum;
    }

    /**
     * @returns the level of the combat skill of the character.
     */
    getCompetenceOfFigurant() {
        return this.data.data.menace;
    }

    /**
     * Gets the level of the specified skill of the simulacre.
     * @param competence The skill for which to get the level.
     * @returns the level.
     */
    getCompetenceOfSimulacre(competence) {

        let sapience = 0;
        for (let v of this.items.filter(v => v.type === 'vecu' && v.data.data.actif === true)) {
            for (let c of v.data.data.competences.filter(c => c.refid === competence.data.data.id)) {
                sapience = sapience + CustomHandlebarsHelpers.getSapiences(v.data.data.degre);
            }
        }
        return sapience;

    }

    /**
     * Gets the level of the specified character skill according to the active periodes.
     * Degre is computed according to the sum of the sapience points.
     * @param competence The skill for which to get the level.
     * @returns the level.
     */
    getCompetence(competence) {
        const sapience = this.getCompetenceSum(competence);
        let degre = 0;
        let cost = 0;
        while (cost <= sapience) {
            degre = degre + 1;
            cost = CustomHandlebarsHelpers.getSapiences(degre);
        }
        return degre - 1;
    }

    /**
     * Gets the number of points of sapience for the specified competence. The number of
     * points is calculated by iterating on each active vecu.
     * @param {Object} competence The competence for which to get the number of sapience.
     * @returns the number of points of sapience.
     */
    getCompetenceSum(competence) {
        let sapience = 0;
        for (let v of this.items.filter(v => v.type === 'vecu' && v.data.data.actif === true)) {
            for (let c of v.data.data.competences.filter(c => c.refid === competence.data.data.id)) {
                sapience = sapience + CustomHandlebarsHelpers.getSapiences(v.data.data.degre);
            }
        }
        return sapience;
    }

    /**
     * Rolls the specified character ka.
     * @param element The element for which to roll.
     */
    async rollKa(element) {
        const ka = element === 'noyau' ? 'Noyau'
            : element === 'pavane' ? 'Pavane'
                : element === 'ka' ? 'Ka'
                    : ('Ka ' + element);
        const filename = element === 'noyau' ? 'noyau.jpg'
            : element === 'pavane' ? 'noyau.jpg'
                : 'ka.jpg';
        const sentence = element === 'pavane' ? 'écoute la Pavane'
            : 'utilise son ' + ka;
        return await Rolls.check(
            this,
            { img: 'systems/neph5e/icons/' + filename },
            ka,
            {
                ...this.data,
                owner: this.id,
                difficulty: this.getKa(element),
                sentence: sentence
            });
    }

    /**
     * Rolls the specified character attribute.
     * Cette methode appele pour les jets depuis les fiches figures, figurants et simulacres
     * @param uuid      The uuid of the actor for which to roll dices.
     * @param self      True if the actor is not the simulacre of a nephilim. 
     * @param attribute The name of the attribute roll or the id of the vecu item.
     */
    async rollSimulacre(uuid, self, attribute) {

        const simulacre = CustomHandlebarsHelpers.getActor(uuid);
        let sentence = "";

        let difficulty = 0;
        switch (attribute) {

            case 'agile':
            case 'endurant':
            case 'fort':
            case 'intelligent':
            case 'seduisant':
            case 'soleil':
            case 'savant':
            case 'sociable':
            case 'fortune':
            case 'menace':
            case 'ka':
                difficulty = simulacre.data.data[attribute];
                sentence = this.getSentence(attribute, self);
                break;

            default:
                const vecu = simulacre.items.get(attribute);
                difficulty = vecu.data.data.degre;
                sentence = this.getSentence('vecu', self);
                break;

        }

        return await Rolls.check(
            this,
            { img: 'systems/neph5e/icons/caracteristique.jpg' },
            attribute,
            {
                ...this.data,
                owner: this.id,
                difficulty: difficulty,
                sentence: sentence,
            });

    }

    /**
     * Gets the level of the specified skill according to the active periodes.
     * @param name The name of the skill for which to get the level. 
     * @returns the skill level.
     */
    getSkill(name) {
        switch (name) {
            case 'melee':
                return this.getCompetenceById(game.settings.get('neph5e', 'uuidMelee'));
            case 'esquive':
                return this.getCompetenceById(game.settings.get('neph5e', 'uuidDodge'));
            case 'martial':
                return this.getCompetenceById(game.settings.get('neph5e', 'uuidHand'));
            case 'best.of.esquive.melee.martial':
                const melee = this.getCompetenceById(game.settings.get('neph5e', 'uuidMelee'));
                const esquive = this.getCompetenceById(game.settings.get('neph5e', 'uuidDodge'));
                const martial = this.getCompetenceById(game.settings.get('neph5e', 'uuidHand'));
                return Math.max(melee, esquive, martial);
            case 'trait':
                return this.getCompetenceById(game.settings.get('neph5e', 'uuidDraft'));
            case 'feu':
                return this.getCompetenceById(game.settings.get('neph5e', 'uuidFire'));
            case 'lourde':
                return this.getCompetenceById(game.settings.get('neph5e', 'uuidHeavy'));
            default:
                return 0;
        }
    }

    /**
     * @returns the wounds modifier.
     */
    getWoundsModifier(type) {
        let modifier = 0;
        const baseDommage = type === 'physique' ? this.data.data.dommage.physique : this.data.data.dommage.magique;
        for (const w in Game.wounds) {
            const wound = Game.wounds[w];
            if (baseDommage[wound.id]) {
                modifier = modifier + wound.modifier;
            }
        }
        return modifier;
    }

    /**
     * Indicates if a pact has been done with the specified invocation.
     * @param {*item} The invocation to check.
     * @returns true if a pact is active.
     */
    hasPactWith(invocation) {
        return this.type === 'figure' ? this.data.data.kabbale.invocations.find(i => i.refid === invocation.data.data.id && i.pacte === true) : false;
    }

    /**
     * @param {*} weapon 
     * @returns the number of impact points getted by the armor against the specified weapon. 
     */
    getProtectionVersus(weapon) {
        const armor = this.items.find(i => i.type === 'armure');
        if (armor === undefined) {
            return 0;
        }
        if (weapon === null) {
            return armor.data.data.contact;
        }
        if (weapon.data.magique) {
            return armor.data.data.magique;
        }
        switch (weapon.data.skill) {
            case 'melee':
                return armor.data.data.contact;
            case 'trait':
                return armor.data.data.trait;
            case 'feu':
            case 'lourde':
                return armor.data.data.feu;
        }
    }

    getSentence(quality, self) {
        switch (quality) {
            case 'agile':
                return self ? " fait appel à son agilité" : "fait appel à l'agilité de son simulacre";
            case 'endurant':
                return self ? " fait appel à son endurance" : "fait appel à l'endurance de son simulacre";
            case 'fort':
                return self ? " fait appel à sa force" : "fait appel à la force de son simulacre";
            case 'intelligent':
                return self ? "fait appel à son intelligence" : "fait appel à l'intelligence de son simulacre";
            case 'seduisant':
                return self ? "fait appel à son charisme" : "fait appel au charisme de son simulacre";
            case 'soleil':
                return self ? "fait appel à sa volonté" : "fait appel à la volonté de son simulacre";
            case 'savant':
                return self ? "fait appel à son savoir" : "fait appel au savoir de son simulacre";
            case 'sociable':
                return self ? "fait appel à ses relations" : "fait appel à aux relations de son simulacre";
            case 'fortune':
                return self ? "fait appel à sa fortune" : "utilise la fortune de son simulacre";
            case 'vecu':
                return self ? "utilise son vécu" : "utilise le vécu de son simulacre";
            case 'menace':
                return "fait appel à ses compétences martiales";
            case 'ka':
                return "fait appel à son ka";
        }
    }

    /**                     CLEAN                   */
    /********************************************** */

    /**
     * Deletes the specified alchimie.
     * @param {*} item The item to delete.
     */
    async deleteAlchimie(item) {

        // Update actor data
        await this.update({ ["data.alchimie.voie.refid"]: null });

    }

    /**
     * Deletes the specified appel.
     * @param {*} item The item to delete.
     */
    async deleteAppel(item) {

        // Update actor data
        const data = duplicate(this.data.data.conjuration);
        const i = data.appels.findIndex(o => o.refid === item.data.data.id);
        if (i !== -1) {
            data.appels.splice(i, 1);
        }
        await this.update({ ["data.conjuration"]: data });

    }

    /**
     * Deletes the specified arcane.
     * @param {*} item The item to delete.
     * @param {*} from The optional period item from which to delete the item.
     */
     async deleteArcane(item, from) {

        // Update actor data
        const data = duplicate(this.data.data.periodes);
        this.data.data.periodes.forEach((p, ip) => {
            if ( from === undefined || from.data.data.id === p.refid ) {
                const i = p.arcanes.findIndex(o => o.refid === item.data.data.id);
                if (i !== -1) {
                    data[ip].arcanes.splice(i, 1);
                }
            }
        });
        await this.update({ ["data.periodes"]: data });

    }

    /**
     * Deletes the specified aspect.
     * @param {*} item The item to delete.
     */
    async deleteAspect(item) {

        // Update actor data
        const data = duplicate(this.data.data.imago);
        const i = data.aspects.findIndex(o => o.refid === item.data.data.id);
        if (i !== -1) {
            data.aspects.splice(i, 1);
        }
        await this.update({ ["data.imago"]: data });

    }

    /**
     * Deletes the specified chute.
     * @param {*} item The item to delete.
     * @param {*} from The optional period item from which to delete the item.
     */
    async deleteChute(item, from) {

        // Update actor data
        const data = duplicate(this.data.data.periodes);
        this.data.data.periodes.forEach((p, ip) => {
            if ( from === undefined || from.data.data.id === p.refid ) {
                const i = p.chutes.findIndex(o => o.refid === item.data.data.id);
                if (i !== -1) {
                    data[ip].chutes.splice(i, 1);
                }
            }
        });
        await this.update({ ["data.periodes"]: data });

    }

    /**
     * Deletes the specified competence.
     * @param {*} item The item to delete.
     */
    async deleteCompetence(item) {

        // Update embedded items
        for (let o of this.items.filter(i => i.type === 'vecu')) {
            const data = o.data.data.competences.filter(i => i.refid !== item.data.data.id);
            await o.update({ ['data.competences']: data });
        }

    }

    /**
     * Deletes the specified formule.
     * @param {*} item The item to delete.
     */
    async deleteFormule(item) {

        // Update actor data
        const data = duplicate(this.data.data.alchimie);
        const i = data.formules.findIndex(o => o.refid === item.data.data.id);
        if (i !== -1) {
            data.formules.splice(i, 1);
        }
        await this.update({ ["data.alchimie"]: data });

    }

    /**
     * Deletes the specified invocation.
     * @param {*} item The item to delete.
     */
    async deleteInvocation(item) {

        // Update actor data
        const data = duplicate(this.data.data.kabbale);
        const i = data.invocations.findIndex(o => o.refid === item.data.data.id);
        if (i !== -1) {
            data.invocations.splice(i, 1);
        }
        await this.update({ ["data.kabbale"]: data });

    }

    /**
     * Deletes the specified magie.
     * @param {*} item The item to delete.
     */
    async deleteMagie(item) {

        // Update actor data
        await this.update({ ["data.magie.voie.refid"]: null });

    }

    /**
     * Deletes the specified materiae primae.
     * @param {*} item The item to delete.
     */
    async deleteMateriae(item) {

        // Update actor data
        const data = duplicate(this.data.data.alchimie);
        const i = data.materiae.findIndex(o => o.refid === item.data.data.id);
        if (i !== -1) {
            data.materiae.splice(i, 1);
        }
        await this.update({ ["data.alchimie"]: data });

    }

    /**
     * Deletes the specified metamorphe.
     * @param {*} item The item to delete.
     */
    async deleteMetamorphe(item) {

        // Update actor data
        await this.update({ ["data.metamorphe"]: { refid: null, metamorphoses: [false, false, false, false, false, false, false, false, false, false] } });

    }

    /**
     * Deletes the specified ordonnance.
     * @param {*} item The item to delete.
     */
    async deleteOrdonnance(item) {

        // Update actor data
        const data = duplicate(this.data.data.kabbale.voie);
        const i = data.ordonnances.findIndex(o => o.refid === item.data.data.id);
        if (i !== -1) {
            data.ordonnances.splice(i, 1);
        }
        await this.update({ ["data.kabbale.voie"]: data });    

    }

    /**
     * Deletes the specified passe.
     * @param {*} item The item to delete.
     * @param {*} from The optional period item from which to delete the item.
     */
    async deletePasse(item, from) {

        // Update actor data
        const data = duplicate(this.data.data.periodes);
        this.data.data.periodes.forEach((p, ip) => {
            if ( from === undefined || from.data.data.id === p.refid ) {
                const i = p.passes.findIndex(o => o.refid === item.data.data.id);
                if (i !== -1) {
                    data[ip].passes.splice(i, 1);
                }
            }
        });
        await this.update({ ["data.periodes"]: data });

    }

    /**
     * Deletes the specified periode.
     * @param {*} item The item to delete.
     */
    async deletePeriode(item) {

        // Update actor data
        if (this.type === 'figure') {
            const data = duplicate(this.data.data.periodes);
            const i = data.findIndex(o => o.refid === item.data.data.id);
            if (i !== -1) {
                data.splice(i, 1);
            }
            await this.update({ ["data.periodes"]: data });
        }

        // Update embedded items
        for (let vecu of this.items.filter(i => i.type === 'vecu' && i.data.data.periode === item.data.data.id)) {
            await this.deleteEmbeddedDocuments('Item', [vecu.id]);
        }

    }

    /**
     * Deletes the specified pratique.
     * @param {*} item The item to delete.
     */
    async deletePratique(item) {

        // Update actor data
        const data = duplicate(this.data.data.denier);
        const i = data.pratiques.findIndex(o => o.refid === item.data.data.id);
        if (i !== -1) {
            data.pratiques.splice(i, 1);
        }
        await this.update({ ["data.denier"]: data });

    }

    /**
     * Deletes the specified quete.
     * @param {*} item The item to delete.
     * @param {*} from The optional period item from which to delete the item.
     */
    async deleteQuete(item, from) {

        // Update actor data
        const data = duplicate(this.data.data.periodes);
        this.data.data.periodes.forEach((p, ip) => {
            if ( from === undefined || from.data.data.id === p.refid ) {
                const i = p.quetes.findIndex(o => o.refid === item.data.data.id);
                if (i !== -1) {
                    data[ip].quetes.splice(i, 1);
                }
            }
        });
        await this.update({ ["data.periodes"]: data });

    }

    /**
     * Deletes the specified rite.
     * @param {*} item The item to delete.
     */
    async deleteRite(item) {

        // Update actor data
        const data = duplicate(this.data.data.necromancie);
        const i = data.rites.findIndex(o => o.refid === item.data.data.id);
        if (i !== -1) {
            data.rites.splice(i, 1);
        }
        await this.update({ ["data.necromancie"]: data });

    }

    /**
     * Deletes the specified rituel.
     * @param {*} item The item to delete.
     */
    async deleteRituel(item) {

        // Update actor data
        const data = duplicate(this.data.data.epee);
        const i = data.rituels.findIndex(o => o.refid === item.data.data.id);
        if (i !== -1) {
            data.rituels.splice(i, 1);
        }
        await this.update({ ["data.epee"]: data });

    }

    /**
     * Deletes the specified savoir.
     * @param {*} item The item to delete.
     * @param {*} from The optional period item from which to delete the item.
     */
    async deleteSavoir(item, from) {

        // Update actor data
        const data = duplicate(this.data.data.periodes);
        this.data.data.periodes.forEach((p, ip) => {
            if ( from === undefined || from.data.data.id === p.refid ) {
                const i = p.savoirs.findIndex(o => o.refid === item.data.data.id);
                if (i !== -1) {
                    data[ip].savoirs.splice(i, 1);
                }
            }
        });
        await this.update({ ["data.periodes"]: data });

    }

    /**
     * Deletes the specified science.
     * @param {*} item The item to delete.
     * @param {*} from The optional period item from which to delete the item.
     */
     async deleteScience(item, from) {

        // Update actor data
        const data = duplicate(this.data.data.periodes);
        this.data.data.periodes.forEach((p, ip) => {
            if ( from === undefined || from.data.data.id === p.refid ) {
                const i = p.sciences.findIndex(o => o.refid === item.data.data.id);
                if (i !== -1) {
                    data[ip].sciences.splice(i, 1);
                }
            }
        });
        await this.update({ ["data.periodes"]: data });

    }

    /**
     * Deletes the specified sort.
     * @param {*} item The item to delete.
     */
    async deleteSort(item) {

        // Update actor data
        const data = duplicate(this.data.data.magie);
        const i = data.sorts.findIndex(o => o.refid === item.data.data.id);
        if (i !== -1) {
            data.sorts.splice(i, 1);
        }
        await this.update({ ["data.magie"]: data });

    }

    /**
     * Deletes the specified technique.
     * @param {*} item The item to delete.
     */
    async deleteTechnique(item) {

        // Update actor data
        const data = duplicate(this.data.data.baton);
        const i = data.techniques.findIndex(o => o.refid === item.data.data.id);
        if (i !== -1) {
            data.techniques.splice(i, 1);
        }
        await this.update({ ["data.baton"]: data });

    }

    /**
     * Deletes the specified tekhne.
     * @param {*} item The item to delete.
     */
    async deleteTekhne(item) {

        // Update actor data
        const data = duplicate(this.data.data.coupe);
        const i = data.tekhnes.findIndex(o => o.refid === item.data.data.id);
        if (i !== -1) {
            data.tekhnes.splice(i, 1);
        }
        await this.update({ ["data.coupe"]: data });

    }

    /**
     * Deletes the specified periode.
     * @param {*} item The item to delete.
     */
     async deleteVecu(item) {

        // Update embedded items
        for (let v of this.items.filter(o => o.type === 'vecu' && o.data.data.periode === item.data.data.periode)) {
            await this.deleteEmbeddedDocuments('Item', [v.id]);
        }

    }

}