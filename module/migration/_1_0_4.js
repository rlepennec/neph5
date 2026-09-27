export class _1_0_4 {

    static async migrate(target) {
        await game.settings.set("neph5e", "worldTemplateVersion", target);
    }

}