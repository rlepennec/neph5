import { DocumentIdentifier } from "./documentIdentifier.js";

/**
 * Mixin apportant le glisser-déposer à une application ApplicationV2.
 *
 * Côté drag : rend déplaçables les éléments `[data-drag="true"]` (glissement interne,
 * identifié par leur `fsid`) et `[data-macro]` (création de macro dans la hotbar).
 *
 * Côté drop : les zones `[data-drop="true"]` acceptent les acteurs, les items et les
 * éléments internes. Le document déposé est routé vers un handler déclaré par
 * l'application dans ses options :
 *  - `tabDropHandlers[onglet][type]` en priorité, pour les types dont le traitement
 *    dépend de l'onglet affiché ;
 *  - `dropHandlers[type]` sinon.
 *
 * Le glisser-déposer est inopérant si l'application n'est pas éditable ou si elle est
 * verrouillée.
 */
export const DragDropMixin = Base => {

    return class DragDroppable extends Base {

        static DEFAULT_OPTIONS = {
            dragDrop: [
                {
                    dragSelector: '[data-drag="true"], [data-macro]',
                    dropSelector: '[data-drop="true"]'
                }
            ]
        }

        dragDrop = this.options.dragDrop.map((d) => {
            d.permissions = {
                dragstart: this.#canDragStart.bind(this),
                drop: this.#canDragDrop.bind(this),
            };
            d.callbacks = {
                dragstart: this.#onDragStart.bind(this),
                dragover: this.#onDragOver.bind(this),
                drop: this.#onDrop.bind(this),
            };
            return new foundry.applications.ux.DragDrop.implementation(d);
        });

        async _onRender(context, options) {
            await super._onRender(context, options);
            this.dragDrop.forEach((d) => d.bind(this.element));
        }

        #canDragStart(selector) {
            return this.isEditable;
        }

        #canDragDrop(selector) {
            return this.isEditable;
        }

        static findDataset(element, attribute) {
            while (element && !(attribute in element.dataset)) {
                element = element.parentElement
            }
            return element?.dataset[attribute] || null
        }

        #onDragStart(event) {

            if ('link' in event.target.dataset) return;

            // Drag d'un élément .macro vers la hotbar -> donnée de macro.
            const macro = event.currentTarget.closest('[data-macro]');
            if (macro != null) {
                const data = { process: 'macro', type: macro.dataset.macro };
                if (macro.dataset.id != null) data.id = macro.dataset.id;
                if (macro.dataset.sid != null) data.sid = macro.dataset.sid;
                // Arme / ressource : item embarqué résolu via fsid.
                if (macro.dataset.fsid != null) {
                    const identifier = new DocumentIdentifier(macro);
                    data.actor = this.document.id;
                    data.id = identifier.id;
                    data.sid = identifier.sid;
                }
                event.dataTransfer.setData('text/plain', JSON.stringify(data));
                return;
            }

            // Drag interne (fsid -> "Sheet").
            const fsid = DragDroppable.findDataset(event.currentTarget, 'fsid');
            if (fsid != null) {
                event.dataTransfer.setData('text/plain', JSON.stringify({
                    type: "Sheet",
                    fsid: fsid
                }))
            }

        }

        #onDragOver(event) {
        }

        async #onDrop(event) {

            if (this.locked) return;

            const dropped = JSON.parse(event.dataTransfer.getData("text/plain"));
            switch (dropped.type) {
                case 'Sheet': {
                    const document = new DocumentIdentifier(new String(dropped.fsid)).toDocument();
                    if (document.parent === this.document) {
                        this._onDrop(event, document);
                    }
                    break;
                }
                case 'Actor':
                case 'Item': {
                    const document = new DocumentIdentifier(event).toDocument();
                    this._onDrop(event, document);
                    break;
                }
            }

        }

        async _onDrop(event, document) {
            const tab = this.tabGroups?.primary;
            // Un même type peut avoir un sens différent selon l'onglet : on cherche
            // d'abord un handler propre à l'onglet courant, sinon celui du type.
            const handler = this.options.tabDropHandlers?.[tab]?.[document.type]
                         ?? this.options.dropHandlers[document.type];
            if (handler) {
                return handler.call(this, event, document);
            }
        }

    }

}