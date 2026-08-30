import { DocumentIdentifier } from "./documentIdentifier.js";
import { NephilimActorSheet } from "../actor/nephilimActorSheet.js";

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
			const weapon = new DocumentIdentifier(target).toDocument();
			if (weapon == null) {
				ui.notifications.error("Arme introuvable");
				return;
			}
			await this.document.rollWeapon(weapon, this.combatant);
		}

		static async _onRollWrestle(event, target) {
			event.preventDefault();
			await this.document.rollWrestle(this.combatant);
		}

		static async _onAim(event, target) {
			event.preventDefault();
			const weapon = new DocumentIdentifier(target).toDocument();
			if (weapon == null) {
				ui.notifications.error("Arme introuvable");
				return;
			}
			await this.document.aim(weapon, this.combatant);
		}

		static async _onReload(event, target) {
			event.preventDefault();
			const weapon = new DocumentIdentifier(target).toDocument();
			if (weapon == null) {
				ui.notifications.error("Arme introuvable");
				return;
			}
			await this.document.reload(weapon, this.combatant);
		}

        static async _onRollPasse(event, target) {
			event.preventDefault();
			const item = new DocumentIdentifier(target).toDocument();
			if (item == null) {
				ui.notifications.error("Passé introuvable");
				return;
			}
			await this.document.rollPasse(item);
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