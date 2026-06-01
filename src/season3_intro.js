import { centerText, createTypewriterText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { OFFSETS, TYPEWRITER_SPEED, FONTSIZE } from "../constants.js";


export default class season3_intro extends Phaser.Scene {
    constructor() {
        super("season3_intro");
    }

    create() {
        this.game.globalState.season = 3;
        this.scene.get('hud').updateStats();
        escapeReset(this);
        centerText(this, "SEASON 3", OFFSETS.SEASON_TITLE_Y, { fontSize: FONTSIZE.HEADING });
        const messageText = this.game.globalState.certified == true
            ? "Mandatory pesticide use is introduced."
            : "Underground seed trading spreads.";
        createTypewriterText(this, messageText, 0, {}, TYPEWRITER_SPEED.FAST,
            () => {
                createMenu(this, {
                    title: "",
                    options: [
                        "[ continue ]"],
                    callbacks: [
                        () => {
                            this.scene.start("season3_choice");
                        }
                    ]
                });
            });
    }
}