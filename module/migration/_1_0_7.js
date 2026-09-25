import { MigrationTools } from "./migration.js";

/**
 * Migration 1.0.7 — les couleurs figées dans les descriptions.
 *
 * LE SYMPTÔME. Sur une fiche d'item en style ashbury, le texte d'une description
 * s'affichait en sombre sur le panneau sombre, donc illisible, alors que le panneau
 * impose une teinte claire à tout ce qu'il contient.
 *
 * LA CAUSE. Le texte lui-même porte sa couleur, dans un attribut `style` ou un vieil
 * attribut `color` de balise <font> — vestige de l'import des contenus. Or un style en
 * ligne l'emporte sur toute règle CSS qui ne s'arme pas d'un !important, ce que le style
 * ashbury a fini par faire pour rester lisible.
 *
 * CE QUE FAIT CETTE MIGRATION. Elle retire ces couleurs de texte des descriptions du
 * monde — items, acteurs, et items embarqués sur les acteurs. Le rendu ne change pas :
 * la teinte retirée est précisément celle que le style écrasait déjà. Ce qui change,
 * c'est que le contenu cesse d'imposer une apparence, et redevient lisible quel que
 * soit le fond — y compris dans le style classique, l'éditeur, ou un futur thème.
 *
 * CE QU'ELLE NE TOUCHE PAS.
 *   - Les compendiums, à commencer par celui du système : ils sont livrés avec la
 *     version et seraient réécrits à la prochaine mise à jour. Un item importé depuis
 *     un compendium après cette migration rapportera donc ses couleurs, d'où le
 *     !important conservé côté style.
 *   - Les couleurs de FOND : seules les couleurs de texte posent le problème de
 *     lisibilité, et retirer un fond changerait l'intention de l'auteur.
 *   - Les autres champs HTML que `system.description` : ce sont les seuls que les
 *     panneaux de description affichent.
 *
 * POURQUOI PASSER PAR LE DOM. Le nettoyage s'appuie sur l'analyseur du navigateur
 * plutôt que sur une expression régulière : `style="color:#000;font-weight:bold"` doit
 * perdre sa couleur et garder sa graisse, ce qu'une regex sur du HTML ne sait pas faire
 * sans se tromper un jour ou l'autre.
 */
export class _1_0_7 {

    static async migrate(target) {

        const msg = "Updating to " + target;
        let nettoyees = 0;
        let traites = 0;
        const size = game.items.size + game.actors.size;

        for (const item of game.items) {
            if (await _1_0_7.nettoyer(item)) nettoyees++;
            MigrationTools.progress(msg, ++traites, size);
        }

        for (const actor of game.actors) {
            if (await _1_0_7.nettoyer(actor)) nettoyees++;
            for (const item of actor.items) {
                if (await _1_0_7.nettoyer(item)) nettoyees++;
            }
            MigrationTools.progress(msg, ++traites, size);
        }

        game.settings.set("neph5e", "worldTemplateVersion", target);

        ui.notifications.info("Update to " + target + " done"
            + (nettoyees > 0 ? " (" + nettoyees + " description(s) nettoyée(s))" : ""));
    }

    /**
     * Retire les couleurs de texte de la description du document.
     * @param document The actor or item to process.
     * @returns true si la description a été réécrite.
     */
    static async nettoyer(document) {
        const nettoyee = _1_0_7.sansCouleur(document.system?.description);
        if (nettoyee == null) return false;
        await document.update({ ['system.description']: nettoyee });
        return true;
    }

    /**
     * @param html The HTML content to clean.
     * @returns le contenu sans aucune couleur de texte figée, null s'il n'y en avait
     *          aucune — auquel cas il n'y a rien à écrire.
     */
    static sansCouleur(html) {

        if (html == null || html === "") return null;

        const conteneur = window.document.createElement("div");
        conteneur.innerHTML = html;
        let touche = false;

        for (const element of conteneur.querySelectorAll("[style], [color], font")) {

            // <font color="..."> : l'attribut d'origine, que les vieux éditeurs posaient.
            if (element.hasAttribute("color")) {
                element.removeAttribute("color");
                touche = true;
            }

            // style="color: ..." : retiré seul, le reste de la déclaration est conservé.
            if (element.style?.color) {
                element.style.removeProperty("color");
                touche = true;
            }

            // Un attribut style devenu vide n'a plus lieu d'être.
            if (element.hasAttribute("style") && element.getAttribute("style").trim() === "") {
                element.removeAttribute("style");
            }
        }

        return touche ? conteneur.innerHTML : null;
    }

}
