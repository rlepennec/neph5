// [V14] FormApplication est supprimé en v14. Son équivalent pour les dialogs avec template
//       HBS est HandlebarsApplicationMixin(ApplicationV2), accessible via foundry.applications.api.
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

// [V14] La classe hérite désormais de HandlebarsApplicationMixin(ApplicationV2)
//       au lieu de FormApplication.
export class AbstractDialog extends HandlebarsApplicationMixin(ApplicationV2) {

    /**
     * Constructor.
     * @param actor The emiter of the dialog.
     */
    constructor(actor) {
        // [V14] super() ne prend plus d'objet cible : ApplicationV2 ne gère plus
        //       de "document" ou "object" passé au constructeur comme FormApplication.
        super();
        // [V14] L'acteur est stocké manuellement dans this.actor.
        //       En v12, il était accessible via this.object (injecté par FormApplication).
        this.actor = actor;
        this.data = null;
    }

    /**
     * @param title The title of the dialog panel.
     * @returns the instance.
     */
    withTitle(title) {
        // [V14] Le titre est désormais dans this.options.window.title
        //       au lieu de this.options.title.
        this.options.window.title = title;
        return this;
    }

    /**
     * @param template The path of the template file used to create the dialog.
     * @returns the instance.
     */
    withTemplate(template) {
        // [V14] Le template est désormais déclaré dans static PARTS (convention
        //       HandlebarsApplicationMixin). Pour le surcharger à l'instance,
        //       on modifie this.constructor.PARTS qui est la référence lue au moment
        //       du rendu. "main" est le nom du part déclaré dans la sous-classe concrète.
        this.constructor.PARTS.main.template = template;
        return this;
    }

    /**
     * @param data The data used to create the content of the dialog.
     * @returns the instance.
     */
    withData(data) {
        this.data = data;
        return this;
    }

    /**
     * @param height The height of the dialog panel.
     * @returns the instance.
     */
    withHeight(height) {
        // [V14] setPosition() nécessite this.element, qui n'existe qu'APRÈS le premier
        //       render. Appelé dans la chaîne de construction (avant .render()), il
        //       plantait (#applyPosition lit this.element.style). On mémorise donc la
        //       hauteur et on l'applique dans _onRender(), une fois le DOM présent.
        this._pendingPosition = { ...(this._pendingPosition ?? {}), height };
        return this;
    }

    /**
     * @param width The width of the dialog panel.
     * @returns the instance.
     */
    withWidth(width) {
        // [V14] Même raison que withHeight : appliqué dans _onRender().
        this._pendingPosition = { ...(this._pendingPosition ?? {}), width };
        return this;
    }

    /**
     * [V14] Applique la position mémorisée (withHeight/withWidth) une fois le DOM
     *       rendu : this.element existe alors et setPosition() fonctionne.
     */
    _onRender(context, options) {
        super._onRender(context, options);
        if (this._pendingPosition != null) {
            this.setPosition(this._pendingPosition);
        }
    }

    /**
     * @returns the default options to manage the dialog.
     */
    // [V14] defaultOptions (static getter retournant foundry.utils.mergeObject(...))
    //       est remplacé par DEFAULT_OPTIONS, une static property (champ de classe).
    //       La structure interne change aussi :
    //         - le titre va dans window.title (et non à la racine)
    //         - les templates sont déclarés par "parts" nommés dans chaque sous-classe
    //       "parts" n'est PAS déclaré ici : Foundry fusionne DEFAULT_OPTIONS en profondeur
    //       sur toute la chaîne d'héritage. Un "parts.main.template" vide défini dans la
    //       classe abstraite écraserait le template réel déclaré dans la sous-classe concrète.
    //       Chaque sous-classe concrète est donc responsable de déclarer ses propres "parts".
    static DEFAULT_OPTIONS = {
        window: {
            title: "",
            resizable: false
        }
    };

    /**
     * Enregistre un ou plusieurs événements sur un ou plusieurs éléments du DOM.
     * Disponible dans toutes les sous-classes pour éviter la répétition du pattern
     * querySelector + addEventListener.
     * @param {HTMLElement} root     - Racine de recherche.
     * @param {string}      selector - Sélecteur CSS.
     * @param {string[]}    events   - Liste de types d'événements.
     * @param {Function}    handler  - Handler à lier.
     * @param {boolean}     all      - Si true, utilise querySelectorAll (plusieurs éléments).
     */
    // [V14] Déplacé depuis ActionDialog vers AbstractDialog pour être réutilisable
    //       par toutes les sous-classes. jQuery (html.find().on()) n'est plus disponible
    //       en ApplicationV2 ; ce helper encapsule le DOM natif équivalent.
    _on(root, selector, events, handler, all = false) {
        const elements = all
            ? root.querySelectorAll(selector)
            : [root.querySelector(selector)].filter(Boolean);
        for (const el of elements) {
            for (const event of events) {
                el.addEventListener(event, handler.bind(this));
            }
        }
    }

    /**
     * Met à jour le textContent d'un élément identifié par son sélecteur CSS.
     * Disponible dans toutes les sous-classes pour éviter la répétition du pattern
     * querySelector + textContent.
     * @param {string} selector - Sélecteur CSS.
     * @param {*}      value    - Valeur à afficher.
     */
    // [V14] Déplacé depuis ActionDialog vers AbstractDialog pour être réutilisable
    //       par toutes les sous-classes. Remplace $('#id').html(...) de jQuery.
    //       On utilise textContent (et non innerHTML) pour éviter toute injection HTML.
    _setText(selector, value) {
        const el = this.element?.querySelector(selector);
        if (el) el.textContent = value;
    }

    /**
     * @override
     */
    // [V14] getData(options) est remplacé par _prepareContext(options), qui est async.
    //       Le contexte retourné est passé directement au template HBS.
    //       this.object.id devient this.actor.id (voir constructeur).
    async _prepareContext(options) {
        const data = foundry.utils.duplicate(this.data);
        data.owner = this.actor.id;
        data.opposed = false;
        return data;
    }

}