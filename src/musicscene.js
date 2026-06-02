import { MUSIC_VOLUME } from "./audioConstants.js";

export default class musicscene extends Phaser.Scene {
    constructor() {
        super("musicscene");
    }

    preload() {
        this.load.audio('backgroundMusic', 'assets/sounds/background.wav');
    }

    create() {
        const music = this.sound.play('backgroundMusic', { loop: true, volume: MUSIC_VOLUME });
        this.game.globalMusic = music;
    }
}
