import { centerText, createTypewriterText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { COLORS, FONTSIZE, TYPEWRITER_SPEED } from "../constants.js";

export default class neighbor_response extends Phaser.Scene {
    constructor() {
        super("neighbor_response");
    }

    create() {
        escapeReset(this);
        if (this.game.globalState.certified == true) {
            // const neighborText = "your neighbors reject certification and are disappointed with your betrayal to the community's traditional practices";
            createTypewriterText(this, "your neighbors reject certification and are disappointed with your betrayal to the community's traditional practices.", -40, { fill: "#ffffffff" }, TYPEWRITER_SPEED.FAST, () => {
                createMenu(this, {
                    title: [""],
                    options: [
                        "[ PLANT SEEDS ]",
                    ],
                    callbacks: [
                        () => {
                            this.game.globalState.neighborScore -= 1;
                            this.scene.get('hud').updateStats();
                            this.scene.start("planting_minigame");
                        }
                    ]
                });
            });

        } else {
            // const neighborText = "your neighbors accept certification, and your sense of community begins to falter";
            createTypewriterText(this, "your neighbors accept certification, and your sense of community begins to falter.", -40, { fill: "#ffffffff" }, TYPEWRITER_SPEED.FAST, () => {
                createMenu(this, {
                    title: [""],
                    options: [
                        "[ PLANT SEEDS ]",
                    ],
                    callbacks: [
                        () => {
                            this.game.globalState.neighborScore -= 1;
                            this.scene.get('hud').updateStats();
                            this.scene.start("planting_minigame");
                        }
                    ]
                });
            });
        }



    }
}