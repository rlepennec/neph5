/**
 * Mixin apportant la gestion des onglets à une application ApplicationV2.
 *
 * Surcharge les trois méthodes d'ApplicationV2 concernées pour que la liste des onglets
 * soit fournie dynamiquement par `_getTabsConfig(group)`, que l'application concrète
 * implémente (cf. FigureSheet, qui la construit depuis TAB_DEFINITIONS). Le format
 * attendu est `{ tabs: [...], initial: "..." }`.
 *
 * Les onglets sont décrits par un objet portant au moins un `id` ; le mixin y ajoute
 * `group`, `label` et `active`.
 */
export const TabsMixin = Base => {

    return class Tabbed extends Base {

        _prepareTabs(group) {
            const {tabs, initial=null} = this._getTabsConfig(group) ?? {tabs: []};
            this.tabGroups[group] ??= initial;
            tabs.forEach(t => {
                t.group = group;
                t.label = t.id;
                t.active = t.id === this.tabGroups[group];
            });
            return tabs;
        }

        _onClickTab(event) {
            const button = event.target;
            const tab = button.dataset.tab;
            if (!tab || button.classList.contains("active") || (event.button !== 0)) return;
            const group = button.dataset.group;
            if (this._changeTab(tab, group)) {
                this.render();
            }
        }

        _changeTab(tab, group) {

            // Retrieve the tab element which should become active
            if (!tab || !group) throw new Error("You must pass both the tab and tab group identifier");
            if ((this.tabGroups[group] === tab)) return false;
            const tabElement = this.form.querySelector(`nav [data-group="${group}"][data-tab="${tab}"]`);
            if (!tabElement) throw new Error(`No matching tab element found for group "${group}" and tab "${tab}"`);

            // Update tab navigation
            for (const t of this.form.querySelectorAll(`nav [data-group="${group}"]`)) {
                t.classList.toggle("active", t.dataset.tab === tab);
                if (t instanceof HTMLButtonElement) t.ariaPressed = `${t.dataset.tab === tab}`;
            }

            this.tabGroups[group] = tab;
            return true;

        }

    }

}