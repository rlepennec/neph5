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
				reload: CombatantSheet._onReload,
				getUp: CombatantSheet._onGetUp
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
			if (!this.canAct) return;
			const weapon = new DocumentIdentifier(target).toDocument();
			if (weapon == null) {
				ui.notifications.error("Arme introuvable");
				return;
			}
			await this.document.rollWeapon(weapon, this.combatant);
		}

		static async _onRollWrestle(event, target) {
			event.preventDefault();
			if (!this.canAct) return;
			await this.document.rollWrestle(this.combatant);
		}

		static async _onGetUp(event, target) {
			event.preventDefault();
			if (!this.canAct) return;
			await this.document.getUp(this.combatant);
		}

		static async _onAim(event, target) {
			event.preventDefault();
			if (!this.canAct) return;
			const weapon = new DocumentIdentifier(target).toDocument();
			if (weapon == null) {
				ui.notifications.error("Arme introuvable");
				return;
			}
			await this.document.aim(weapon, this.combatant);
		}

		static async _onReload(event, target) {
			event.preventDefault();
			if (!this.canAct) return;
			const weapon = new DocumentIdentifier(target).toDocument();
			if (weapon == null) {
				ui.notifications.error("Arme introuvable");
				return;
			}
			await this.document.reload(weapon, this.combatant);
		}

        static async _onRollPasse(event, target) {
			event.preventDefault();
			if (!this.canAct) return;
			const item = new DocumentIdentifier(target).toDocument();
			if (item == null) {
				ui.notifications.error("Passé introuvable");
				return;
			}
			await this.document.rollPasse(item);
		}

		static async _onUseEquipment(event, target) {
			event.preventDefault();
			if (!this.canAct) return;
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
			if (!this.canAct) return;
			await this.document.setActiveEffect("Stunned");
		}

		/**
		 * Toggle the specified effect which can be restrain, prone and stun.
		 * @param event The event to handle.
		 */
		static async _onSetImmobilise(event, target) {
			event.preventDefault();
			if (!this.canAct) return;
			await this.document.setActiveEffect("Restrained");
		}

		/**
		 * Toggle the specified effect which can be restrain, prone and stun.
		 * @param event The event to handle.
		 */
		static async _onSetProjete(event, target) {
			event.preventDefault();
			if (!this.canAct) return;
			await this.document.setActiveEffect("Prone");
		}

		/** @override */
		async _prepareContext(options) {
			const context = await super._prepareContext(options);
			context.canAct = this.canAct;
			return context;
		}

		/**
		 * @returns true si l'acteur peut agir : ce n'est pas son combattant dans un combat
		 *          en cours qui bloque, ou bien c'est son tour. Le MJ est soumis à la même
		 *          règle que les joueurs — aucune exemption.
		 *
		 * Ne passe PAS par `this.combatant` : celui-ci dépend d'`openingToken`, qui repose
		 * sur le token sélectionné sur le canevas (cf son propre commentaire — une
		 * convention, pas la réponse exacte). Juste après le début d'un combat ou après un
		 * F5, rien n'est encore sélectionné : `openingToken` renverrait null, `combatant`
		 * aussi, et canAct autoriserait alors l'action à tort. Ici on vérifie directement,
		 * via l'acteur, si UN de ses combattants (quel que soit le token) est celui dont
		 * c'est le tour — indépendant de toute sélection sur le canevas.
		 */
		get canAct() {
			const combat = game.combat;
			if (combat == null) return true;
			const combatants = combat.getCombatantsByActor(this.document);
			if (combatants.length === 0) return true;
			return combatants.includes(combat.combatant);
		}

		/**
		 * @return the actor combatant or null.
		 *
		 * Même raison que canAct ci-dessus : ne dépend d'openingToken (donc de la
		 * sélection sur le canevas) qu'en dernier recours. Dans l'immense majorité des
		 * cas l'acteur n'a qu'un seul combattant engagé dans le combat en cours — on le
		 * renvoie directement, sans passer par le canevas. openingToken ne sert plus
		 * qu'à départager le cas rare de plusieurs combattants pour le même acteur
		 * (plusieurs tokens liés engagés simultanément).
		 */
		get combatant() {

			const combat = game.combat;
			if (combat == null) {
				return null;
			}

			const combatants = combat.getCombatantsByActor(this.document);
			if (combatants.length === 0) {
				return null;
			}
			if (combatants.length === 1) {
				return combatants[0];
			}

			const token = this.openingToken;
			const combatant = token?.combatant;
			return combatant != null && combatants.includes(combatant) ? combatant : combatants[0];

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