import { centerText, createTypewriterText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { COLORS, FONTSIZE } from "../constants.js";

export default class neighbor_response extends Phaser.Scene {
    constructor() {
        super("neighbor_response");
    }

    create() {
        escapeReset(this);
        if (this.game.globalState.certified == true) {
            createTypewriterText(this, "your neighbors reject certification and are dissapointed with your betrayal to the community's traditional practices", 0, {fontSize: FONTSIZE.MENU});
        } else {
            createTypewriterText(this, "your neighbors accept certification, and your sense of community begins to falter", 0, {fontSize: FONTSIZE.MENU});
        }
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
    }
}
