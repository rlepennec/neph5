import { CustomHandlebarsHelpers } from "../common/handlebars.js";
import { Rolls } from "../common/rolls.js";
import { Game } from "../common/game.js";
import { Rules } from "../common/rules.js";
import { getByPath } from "../common/tools.js";
import { Strike } from "../combat/melee/strike.js";
import { Fire } from "../combat/ranged/fire.js";
import { Move } from "../combat/maneuver/move.js";
import { Wrestle } from "../combat/unarmed/wrestle.js";
import { Defend } from "../combat/defense/defend.js";
import { State } from "../combat/state.js";

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
     * Executes the related macro.
     * @param token The token for which to execute the macro.
     */
    async etat(token) {
        if (game.combat === null) {
            ui.notifications.warn("Aucun combat !");
            return;
        }
        if (token.combatant === null) {
            ui.notifications.warn("Vous n'êtes pas en combat !");
            return;
        }
        if (this.unlocked()) {
            this.lock();
            await new State(this, token).doit();
        }
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
                        next: Rules.getNextCost(item.degre + 1)
                    });
                } else {
                    sums[index].degre = sums[index].degre + item.degre;
                    sums[index].next = Rules.getNextCost(sums[index].degre + 1);
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
     * Gets the level of the specified items for the first active periodes.
     * @param items The items of the periodes in which to find. The allowed items are: vecus
     * @param item The item for which to get the level.
     * @returns 
     */
    getLevelFrom(items, item) {
        for (let periode of this.data.data.periodes.filter(p => p.active)) {
            for (let it of periode[items].filter(i => i.refid === item.data.data.id)) {
                return it.degre;
            }
        }
        return 0;
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
        const vecu = CustomHandlebarsHelpers.getItem(this.data.data.vecu.refid);
        if (vecu != undefined) {
            const item = vecu.data.data.competences.find(c => c.refid === competence.data.data.id);
            if (item != undefined) {
                return this.data.data.vecu.degre;
            }
        }
        return 0;
    }

    /**
     * Gets the level of the specified character skill according to the active periodes.
     * Degre is computed according to the sum of the sapience points.
     * @param competence The skill for which to get the level.
     * @returns the level.
     */
    getCompetence(competence) {
        const sapience = this.getCompetenceSum(competence);
        return Rules.toDegre(sapience);
    }

    /**
     * Gets the number of points of sapience for the specified competence. The number of
     * points is calculated by iterating on each active vecu.
     * @param {Object} competence The competence for which to get the number of sapience.
     * @returns the number of points of sapience.
     */
    getCompetenceSum(competence) {
        let sapience = 0;
        for (let p of this.data.data.periodes.filter(p => p.active)) {
            for (let v of p.vecus) {
                const vecu = CustomHandlebarsHelpers.getItem(v.refid);
                for (let r of vecu.data.data.competences.filter(i => i.refid === competence.data.data.id)) {
                    sapience = sapience + Rules.getCostTo(v.degre);
                }
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
     * @param attribute The name of the attribute roll.
     */
    async rollSimulacre(uuid, self, attribute) {

        const simulacre = CustomHandlebarsHelpers.getActor(uuid);
        const sentence = Rules.getSentence(attribute, self);

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
                break;

            case 'vecu':
                difficulty = simulacre.data.data.vecu.degre;
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
                return this.getCompetenceById(Game.skills.melee.uuid);
            case 'esquive':
                return this.getCompetenceById(Game.skills.esquive.uuid);
            case 'martial':
                return this.getCompetenceById(Game.skills.martial.uuid);
            case 'best.of.esquive.melee.martial':
                const melee = this.getCompetenceById(Game.skills.melee.uuid);
                const esquive = this.getCompetenceById(Game.skills.esquive.uuid);
                const martial = this.getCompetenceById(Game.skills.martial.uuid);
                return Math.max(melee, esquive, martial);
            case 'trait':
                return this.getCompetenceById(Game.skills.trait.uuid);
            case 'feu':
                return this.getCompetenceById(Game.skills.feu.uuid);
            case 'lourde':
                return this.getCompetenceById(Game.skills.lourde.uuid);
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
            case Game.skills.melee.id:
                return armor.data.data.contact;
            case Game.skills.trait.id:
                return armor.data.data.trait;
            case Game.skills.feu.id:
            case Game.skills.lourde.id:
                return armor.data.data.feu;
        }
    }

}