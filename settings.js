export class Settings {

    static register() {

        game.settings.register('neph5e', 'system-version', {
            config: true,
            scope: 'world',
            type: String,
            choices: {
                'v5': 'Version 5'
            },
            default: 'v5'
        });

    }

}