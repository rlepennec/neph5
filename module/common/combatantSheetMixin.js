import { Constants } from "./constants.js";
import { Distance } from "../../feature/combat/core/distance.js";
import { DocumentIdentifier } from "./documentIdentifier.js";
import { FeatureBuilder } from "../../feature/core/featureBuilder.js";
import { Melee } from "../../feature/combat/core/melee.js";
import { Menace } from "../../feature/combat/core/menace.js";
import { Naturelle } from "../../feature/combat/core/naturelle.js";
import { NephilimActorSheet } from "../actor/nephilimActorSheet.js";
import { Recharger } from "../../feature/combat/manoeuver/recharger.js";
import { Viser } from "../../feature/combat/manoeuver/viser.js";
import { Wrestle } from "../../feature/combat/core/wrestle.js";

export const CombatantMixinSheet = Base => {

    return class CombatantSheet extends Base {

		static DEFAULT_OPTIONS = {
			actions: {
				rollWeapon: CombatantSheet._onRollWeapon,
				rollWrestle: CombatantSheet._onRollWrestle,
				rollPasse: CombatantSheet._onRollPasse,
				setDesoriente: CombatantSheet._onSetDesoriente,
				setImmobilise: CombatantSheet._onSetImmobilise,
				setProjete: CombatantSheet._onSetProjete,
				useArmor: CombatantSheet._onUseEquipment,
				useWeapon: CombatantSheet._onUseEquipment,
				aim: CombatantSheet._onAim,
				reload: CombatantSheet._onReload
			},
			deleteHandlers: {
				"arme": NephilimActorSheet._onDeleteItem,
				"armure": NephilimActorSheet._onDeleteItem
			},
			dropHandlers: {
				"arme": NephilimActorSheet._onDropItem,
				"armure": NephilimActorSheet._onDropItem
			}
		}

		static async _onRollWeapon(event, target) {
			event.preventDefault();

			// The weapon item document
			const weapon = new DocumentIdentifier(target).toDocument();
			if (weapon == null) {
				ui.notifications.error("Weapon item not found" + target + " done");
				return;
			}

			// Engaged in the current combat: use the combat system
			if (this.combatant != null) {

				// Actor must be free
				if (this.document.immobilise === true) {
					ui.notifications.info("Le personnage est immobilisé");
					return;
				}

				// The target has been selected
				if (this.document.target == null) {
					ui.notifications.info("Le personnage n'a pas selectionné de cible");
					return;
				}

				// Finalize the roll
				switch (weapon.system.type) {
					case Constants.NATURELLE:
						await new Naturelle(this.document, weapon).initializeRoll();
						break;
					case Constants.MELEE:
						await new Melee(this.document, weapon).initializeRoll();
						break;
					case Constants.TRAIT:
						await new Distance(this.document, weapon).initializeRoll();
						break;
					case Constants.FEU:
						if (weapon.system.munitions - weapon.system.tire > 0) {
							await new Distance(this.document, weapon).initializeRoll();
						} else {
							ui.notifications.info("L'arme du personnage n'a plus de munitions");
						}
						break;
					default:
						ui.notifications.info("Type d'arme " + weapon.system.type + " inconnu");
						break;
				}

				return;
			}

			// Not engaged: just roll the martial skill of the weapon. The feature
			// can be null -- system.competence is nullable -- and initializeRoll
			// would then throw.
			const feature = new FeatureBuilder(this.document)
				.withScope("actor")
				.withOriginalItem(weapon.system.competence)
				.create();
			if (feature != null) {
				await feature.initializeRoll();
			} else {
				ui.notifications.error("Error while creating a feature");
			}

		}

		static async _onRollWrestle(event, target) {
			event.preventDefault();

			// Engaged in the current combat: use the combat system
			if (this.combatant != null) {

				// Une figure doit avoir défini sa lutte : le constructeur de
				// Wrestle lit system.manoeuvres.lutte, et baseName déréférence
				// l'item trouvé. isLutteAvailable rend vrai pour un figurant,
				// que Wrestle sait traiter par sa Menace.
				if (this.document.isLutteAvailable === false) {
					ui.notifications.info("La lutte n'est pas définie pour le personnage");
					return;
				}

				// Immobilisé, la lutte reste possible, et sans cible : c'est la
				// manœuvre Libérer, dont canBePerformed exige justement
				// actor.immobilise. Bloquer ici la rendrait injouable.
				if (this.document.immobilise !== true && this.document.target == null) {
					ui.notifications.info("Le personnage n'a pas sélectionné de cible");
					return;
				}

				await new Wrestle(this.document).initializeRoll();
				return;

			}

			// Not engaged: the simple roll depends on the type of actor.
			switch (this.document.type) {

				// Un figurant n'a pas de system.manoeuvres : son jet martial est
				// un jet de Menace, comme dans Combat.simpleAttack.
				case 'figurant':
					await new Menace(this.document).initializeRoll();
					return;

				case 'figure': {

					if (this.document.isLutteAvailable === false) {
						ui.notifications.info("La lutte n'est pas définie pour le personnage");
						return;
					}

					const feature = new FeatureBuilder(this.document)
						.withScope("actor")
						.withOriginalItem(this.document.system.manoeuvres.lutte)
						.create();
					if (feature != null) {
						await feature.initializeRoll();
					} else {
						ui.notifications.error("Error while creating a feature");
					}
					return;

				}

			}

		}

		static async _onAim(event, target) {
			event.preventDefault();

			// The weapon item document
			const weapon = new DocumentIdentifier(target).toDocument();
			if (weapon == null) {
				ui.notifications.error("Weapon item not found" + target + " done");
				return;
			}

			await new Viser().apply(new Distance(this.document, weapon));

		}

		static async _onReload(event, target) {
			event.preventDefault();

			// The weapon item document
			const weapon = new DocumentIdentifier(target).toDocument();
			if (weapon == null) {
				ui.notifications.error("Weapon item not found" + target + " done");
				return;
			}

			await new Recharger().apply(new Distance(this.document, weapon));
		}


        static async _onRollPasse(event, target) {
            event.preventDefault();
            const item = new DocumentIdentifier(target).toDocument();
            if (item == null) return;
            const builder = new FeatureBuilder(this.document).withScope('actor');
            const feature = (item.isEmbedded
                ? builder.withEmbeddedItem(item.id)
                : builder.withOriginalItem(item.sid)).create();
            await feature.initializeRoll();
        }

		static async _onUseEquipment(event, target) {
			event.preventDefault();
			const document = new DocumentIdentifier(target).toDocument();
			switch (document.type) {
				case 'arme':
				case 'armure':
					// Set the usage of the melee or the ranged weapon
					await this.document.toggleEquipmentUsage(document);
					break;
			}
		}


		/**
		 * Toggle the specified effect which can be restrain, prone and stun.
		 * @param event The event to handle.
		 */
		static async _onSetDesoriente(event, target) {
			event.preventDefault();
			await this.document.setActiveEffect("Stunned");
		}

		/**
		 * Toggle the specified effect which can be restrain, prone and stun.
		 * @param event The event to handle.
		 */
		static async _onSetImmobilise(event, target) {
			event.preventDefault();
			await this.document.setActiveEffect("Restrained");
		}

		/**
		 * Toggle the specified effect which can be restrain, prone and stun.
		 * @param event The event to handle.
		 */
		static async _onSetProjete(event, target) {
			event.preventDefault();
			await this.document.setActiveEffect("Prone");
		}

		/**
		 * @return the actor combatant or null.
		 */
		get combatant() {

			// The opening token
			const token = this.openingToken;
			if (token == null || token.combatant == null) {
				return null;
			}

			// The active combat
			const combat = game.combat;
			if (combat == null) {
				return null;
			}

			// The combatant
			const combatants = combat?.getCombatantsByActor(this.document);
			return combatants.includes(token.combatant) ? token.combatant : null;

		}

		/**
		 * Le token depuis lequel cette fiche a été ouverte, si Foundry le sait.
		 *
		 * Foundry ne conserve cette information que pour un token NON LIÉ : la fiche
		 * gère alors son ActorDelta et ActorSheetV2.token le désigne. Un token LIÉ
		 * ouvre la fiche de l'acteur du monde — une seule fiche pour toutes ses
		 * figurines — et le clic d'origine n'est enregistré nulle part.
		 *
		 * Les deux replis ci-dessous sont des CONVENTIONS, pas la réponse exacte :
		 *   - un acteur qui n'a qu'un seul token sur la scène : aucune ambiguïté ;
		 *   - sinon, le token sélectionné, qui est en pratique celui qu'on a cliqué.
		 *
		 * @returns le TokenDocument, ou null si rien ne permet de trancher.
		 */
		get openingToken() {

			const actor = this.document;

			// 1. Token non lié : Foundry le sait, c'est exact.
			if (actor.token != null) {
				return actor.token;
			}

			// 2. Un seul token lié de cet acteur sur la scène : pas d'ambiguïté.
			const tokens = actor.getActiveTokens(false, true);
			if (tokens.length === 1) {
				return tokens[0];
			}

			// 3. Plusieurs tokens liés, ou aucun : on retient celui que l'utilisateur a sélectionné.
			const selected = canvas.tokens?.controlled?.find(t => t.actor?.id === actor.id)?.document;
			return selected ?? null;

		}

	}
		
}