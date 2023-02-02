export class _1_0_4 {

    static async migrate(target) {
        game.settings.set("neph5e", "worldTemplateVersion", target);
    }

}