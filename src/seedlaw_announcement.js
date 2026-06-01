import { centerText, createTypewriterText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { OFFSETS, TYPEWRITER_SPEED } from "../constants.js";


export default class seedlaw_announcement extends Phaser.Scene {
    constructor() {
        super("seedlaw_announcement");
    }

    preload() {
        this.load.image('tv', 'assets/tv_sowwhat.png');
        // this.load.audio('seedlawAudio', 'assets/sounds/seedlaw-speech.mp3');
    }

    create() {
        this.game.globalState.season = 2;
        this.scene.get('hud').updateStats();
        this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'tv').setScale(2.5);
        this.scene.setVisible(true, 'hud');
        escapeReset(this);
        centerText(this, "SEASON 2 ", OFFSETS.SEASON_TITLE_Y, { fontSize: "40px" });
        const messageText = "RADIO ANNOUNCEMENT: new law passed!\n\n'" + this.game.globalState.crop + " seeds are now patented by Monsanto. all farmers MUST use certified seeds from corporate suppliers. penalties for planting uncertified seeds include fines and loss of land tenure.'";
        createTypewriterText(this, messageText, 0, {}, TYPEWRITER_SPEED.FAST,
            () => {
                createMenu(this, {
                    title: "",
                    options: [
                        "[ continue ]"],
                    callbacks: [
                        () => {
                            if (this.game.globalState.certified) {
                                this.scene.start("neighbor_response");
                            } else {
                                this.scene.start("certify_choice");
                            }
                        }
                    ]
                })
            });
        // this.sound.play('seedlawAudio');

        // this.input.keyboard.once("keydown-SPACE", () => this.scene.start("certify"));
        // this.input.keyboard.once("keydown-ENTER", () => this.scene.start("certify"));           
    }
}
