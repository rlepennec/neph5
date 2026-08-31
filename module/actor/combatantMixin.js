import { ActiveEffects } from "../../feature/core/effects.js";
import { Constants } from "../common/constants.js";
import { Distance } from "../../feature/combat/core/distance.js";
import { FeatureBuilder } from "../../feature/core/featureBuilder.js";
import { Game } from "../common/game.js";
import { Melee } from "../../feature/combat/core/melee.js";
import { Menace } from "../../feature/combat/core/menace.js";
import { Naturelle } from "../../feature/combat/core/naturelle.js";
import { Recharger } from "../../feature/combat/manoeuver/recharger.js";
import { Viser } from "../../feature/combat/manoeuver/viser.js";
import { Wrestle } from "../../feature/combat/core/wrestle.js";

/**
 * [V14] Tout ce que NephilimActor savait du combat vit desormais ici.
 *
 * POURQUOI UN MIXIN, ET PAS UN OBJET DELEGUE.
 * Les fiches lisent ces membres DIRECTEMENT sur le document :
 *   feature/figure/combat.hbs, feature/figurant/combat.hbs
 *     {{document.weapons}}, {{document.armors}}, {{document.physicalModifier}},
 *     {{document.esquive}}, {{#unless document.isLutteAvailable}}
 *   feature/nephilim/actor/main.hbs, feature/selenim/actor/main.hbs
 *     {{actor.initiative}}, {{actor.dommage}}
 * Un objet `actor.combat` aurait impose de reecrire ces expressions. Le mixin
 * laisse `actor.rollWeapon(...)` et `{{document.weapons}}` inchanges : aucun site
 * d'appel et aucun template n'a bouge. C'est aussi l'idiome deja en place dans le
 * systeme (NephilimMixinSheet, LockableMixin, DragDropMixin, CombatantSheetMixin).
 *
 * PAS DE CYCLE D'IMPORT. Verifie : aucun des onze modules importes ici n'atteint
 * nephilimActor.js, meme indirectement (97 modules explores). La clause
 * `extends CombatantMixin(Actor)` ne peut donc pas rencontrer la zone morte
 * temporelle qui avait frappe savoir.js.
 *
 * CE FICHIER NE FAIT QUE DEPLACER. Aucun corps n'a ete modifie : meme code, meme
 * ordre que dans nephilimActor.js. Les corrections restent a faire separement,
 * pour qu'un diff de comportement ne se cache jamais dans un diff de deplacement.
 *
 * @param Base La classe de base a etendre, Actor en pratique.
 */
export const CombatantMixin = Base => {

    return class Combatant extends Base {

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
         * @returns true if lutte manoeuver is available for the actor. 
         */
        get isLutteAvailable() {
            return this.type !== 'figure' || this.system.manoeuvres.lutte != null;
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

        async setActiveEffect(name) {
            await ActiveEffects.toggle(this, ActiveEffects.get(name));
        }

        async activateEffect(name) {
            await ActiveEffects.activate(this, ActiveEffects.get(name));
        }

        async deactivateEffect(name) {
            await ActiveEffects.deactivate(this, ActiveEffects.get(name));
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

        /**
         * Le combattant de cet acteur dans le combat en cours, vu depuis l'acteur seul.
         * Moins précis que CombatantSheet.combatant : faute de clic, tokenOf rend le
         * PREMIER token trouvé sur la scène quand l'acteur en a plusieurs.
         */
        get combatant() {
            return this.tokenOf?.combatant ?? null;
        }

        /**
         * Le jet d'attaque avec une arme.
         * @param weapon    L'arme embarquée.
         * @param combatant Le combattant à considérer, null hors combat. La fiche
         *                  passe celui de son token d'ouverture, la macro le sien.
         */
        async rollWeapon(weapon, combatant) {

            if (combatant == null) {
                const feature = new FeatureBuilder(this)
                    .withScope("actor")
                    .withOriginalItem(weapon.system.competence)
                    .create();
                if (feature == null) {
                    ui.notifications.error("Aucune compétence n'est associée à cette arme");
                    return;
                }
                await feature.initializeRoll();
                return;
            }

            if (this.immobilise === true) {
                ui.notifications.info("Le personnage est immobilisé");
                return;
            }
            if (this.target == null) {
                ui.notifications.info("Le personnage n'a pas sélectionné de cible");
                return;
            }

            switch (weapon.system.type) {
                case Constants.NATURELLE: await new Naturelle(this, weapon).initializeRoll(); break;
                case Constants.MELEE:     await new Melee(this, weapon).initializeRoll();     break;
                case Constants.TRAIT:     await new Distance(this, weapon).initializeRoll();  break;
                case Constants.FEU:
                    if (weapon.system.munitions - weapon.system.tire > 0) {
                        await new Distance(this, weapon).initializeRoll();
                    } else {
                        ui.notifications.info("L'arme du personnage n'a plus de munitions");
                    }
                    break;
                default:
                    ui.notifications.info("Type d'arme " + weapon.system.type + " inconnu");
            }
        }

        /**
         * Le jet de lutte.
         *
         * Même partage que rollWeapon : la règle vit ici, la fiche et la macro
         * n'apportent que leur propre notion de combattant.
         *
         * Les gardes ne sont PAS celles de rollWeapon, et c'est délibéré :
         * l'immobilisation n'interdit pas la lutte, elle en est le motif. La
         * manœuvre Libérer, du pool de Wrestle, a pour garde
         * `canBePerformed(action) { return action.actor.immobilise; }` — bloquer ici
         * la rendrait injouable. Un personnage qui se dégage d'une prise n'a par
         * ailleurs personne à cibler.
         *
         * @param combatant Le combattant de cet acteur, null s'il n'est pas engagé.
         */
        async rollWrestle(combatant) {

            // Engagé : le système de combat.
            if (combatant != null) {

                // Une figure doit avoir défini sa lutte : le constructeur de Wrestle
                // lit system.manoeuvres.lutte et baseName déréférence l'item trouvé.
                // isLutteAvailable rend vrai pour un figurant, que Wrestle sait
                // traiter par sa Menace.
                if (this.isLutteAvailable === false) {
                    ui.notifications.info("La lutte n'est pas définie pour le personnage");
                    return;
                }

                // Cible exigée, SAUF immobilisé : voir l'en-tête.
                if (this.immobilise !== true && this.target == null) {
                    ui.notifications.info("Le personnage n'a pas sélectionné de cible");
                    return;
                }

                await new Wrestle(this).initializeRoll();
                return;

            }

            // Hors combat : le jet simple dépend du type d'acteur.
            switch (this.type) {

                // Un figurant n'a pas de system.manoeuvres — seul figure.mjs déclare
                // le champ. Son jet martial est un jet de Menace, comme le fait
                // Combat.simpleAttack.
                case 'figurant':
                    await new Menace(this).initializeRoll();
                    return;

                case 'figure': {

                    if (this.isLutteAvailable === false) {
                        ui.notifications.info("La lutte n'est pas définie pour le personnage");
                        return;
                    }

                    const feature = new FeatureBuilder(this)
                        .withScope("actor")
                        .withOriginalItem(this.system.manoeuvres.lutte)
                        .create();
                    if (feature == null) {
                        ui.notifications.error("La compétence de lutte est introuvable");
                        return;
                    }
                    await feature.initializeRoll();
                    return;

                }

            }

        }

        /**
         * Viser la cible désignée avec l'arme.
         *
         * Le prédicat vit désormais ici, aimAvailable ayant disparu de l'item. Les
         * gardes vont du moins cher au plus cher, la construction de Distance étant
         * la seule qui coûte.
         *
         * @param weapon    L'arme EMBARQUÉE : cible, visée et munitions sont l'état
         *                  de cet acteur. Non null, l'appelant s'en assure.
         * @param combatant Le combattant de cet acteur, null s'il n'est pas engagé.
         */
        async aim(weapon, combatant) {

            // L'arme doit être embarquée et en main.
            if (weapon?.type !== 'arme' || weapon.actor == null || weapon.system.used !== true) {
                ui.notifications.info("L'arme n'est pas en main");
                return;
            }

            // Viser est une manœuvre de combat.
            if (combatant == null) {
                ui.notifications.info("Le personnage n'est pas engagé dans le combat");
                return;
            }

            // Le personnage doit être libre de ses mouvements.
            if (this.immobilise === true) {
                ui.notifications.info("Le personnage est immobilisé");
                return;
            }

            // Une cible, et une seule : target rend null pour zéro comme pour plusieurs.
            if (this.target == null) {
                ui.notifications.info("Le personnage n'a pas sélectionné de cible");
                return;
            }

            // Seules les armes à distance se visent.
            switch (weapon.system.type) {
                case Constants.TRAIT:
                case Constants.FEU:
                    break;
                default:
                    ui.notifications.info("Cette arme ne se vise pas");
                    return;
            }

            // Viser.canBePerformed porte la règle propre à la manœuvre : munitions
            // restantes, et trois rounds de visée au maximum sur la même cible.
            const action = new Distance(this, weapon);
            const viser = new Viser();
            if (viser.canBePerformed(action) === false) {
                ui.notifications.info("La visée est déjà à son maximum sur cette cible");
                return;
            }

            await viser.apply(action);

        }

        /**
         * Recharger l'arme.
         *
         * @param weapon    L'arme embarquée à recharger.
         * @param combatant Le combattant de cet acteur, null s'il n'est pas engagé.
         */
        async reload(weapon, combatant) {

            if (weapon?.type !== 'arme' || weapon.actor == null || weapon.system.used !== true) {
                ui.notifications.info("L'arme n'est pas en main");
                return;
            }

            if (combatant == null) {
                ui.notifications.info("Le personnage n'est pas engagé dans le combat");
                return;
            }

            if (this.immobilise === true) {
                ui.notifications.info("Le personnage est immobilisé");
                return;
            }

            switch (weapon.system.type) {
                case Constants.TRAIT:
                case Constants.FEU:
                    break;
                default:
                    ui.notifications.info("Cette arme ne se recharge pas");
                    return;
            }

            // Recharger.canBePerformed : au moins un coup tiré.
            const action = new Distance(this, weapon);
            const recharger = new Recharger();
            if (recharger.canBePerformed(action) === false) {
                ui.notifications.info("L'arme n'a pas besoin d'être rechargée");
                return;
            }

            await recharger.apply(action);

        }

    }

}