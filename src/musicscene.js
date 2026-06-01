export default class musicscene extends Phaser.Scene {
    constructor() {
        super("musicscene");
    }

    preload() {
        this.load.audio('backgroundMusic', 'assets/sounds/background.wav');
    }

    create() {
        const music = this.sound.play('backgroundMusic', { loop: true, volume: 0.5 });
        this.game.globalMusic = music;
    }
}
