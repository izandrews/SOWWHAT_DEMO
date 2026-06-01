import { centerText, createTypewriterText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { OFFSETS, TYPEWRITER_SPEED, FONTSIZE } from "../constants.js";

export default class season1_intro extends Phaser.Scene {
    constructor() {
        super("season1_intro");
    }

    create() {
        // this.scene.setVisible(true, 'hud');
        escapeReset(this);
        // centerText(this, "press button to continue ", 150, {fill: "#ffffffff", align: "center"});

        centerText(this, "", OFFSETS.SEASON_TITLE_Y, { fontSize: FONTSIZE.HEADING });

        // Create typewriter text with animation, then menu after complete
        createTypewriterText(
            this,
            "you are a small-scale farmer in rural kenya. your local community relies on the yield from you and your neighbors' farms. your goal is to maintain your farm to feed your community.\n\nbut BE CAREFUL... a wrong decision could lead to disaster. make your choices wisely.",
            -80,
            { fill: "#ffffffff" },
            TYPEWRITER_SPEED.FAST,
            () => {
                createMenu(this, {
                    title: "PICK YOUR CROP",
                    options: ["[ COWPEA ]", "[ CORN ]"],
                    callbacks: [
                        () => {
                            this.game.globalState.cropU = "COWPEA";
                            this.game.globalState.cropL = "cowpea";
                            this.scene.get('hud').updateStats();
                            this.scene.start("certify_choice")

                        },
                        () => {
                            this.game.globalState.cropU = "CORN";
                            this.game.globalState.cropL = "corn";

                            this.scene.get('hud').updateStats();
                            this.scene.start("certify_choice")

                        }
                    ],
                    fontColor: "#ffffff",
                    highlightColor: "#1645f5"
                });
            }
        );
    }

}

