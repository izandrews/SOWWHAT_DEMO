import { centerText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { COLORS, FONTSIZE, OFFSETS } from "../constants.js";

export default class demo_ending extends Phaser.Scene {
    constructor() {
        super("demo_ending");
    }

    create() {
        escapeReset(this);
        this.cameras.main.setBackgroundColor(COLORS.BLACK);

        const state = this.game.globalState;
        // centerText(this, "GAME OVER", OFFSETS.SEASON_TITLE_Y, { fill: "#ffffff", fontSize: FONTSIZE.HEADING, align: "center" });
        let color = "#ffffff";
        let body = "";
        if (this.game.globalState.escapedJail == true) {
            body = "you've escaped jail and become you an outlawed farmer, but your future remains uncertain as you must leave you farm behind and start anew elsewhere.";
        } else if (this.game.globalState.certified == true) {
            body = "you are sentenced to prison for 5 years for your crimes and attempt to escape jail. your neighbours are disappointed in your betrayal of the community and refuse to look after your farm. your future as a farmer looks grim.";
        } else {
            body = "you are sentenced to prison for 5 years for your crimes and attempt to escape jail.\nyour farm is left in the hands of your neighbours, who have grown money-hungry and caught in corporate cycles. your future as a farmer looks grim.";
        }

        centerText(this, "GAME OVER", OFFSETS.SEASON_TITLE_Y, { fill: "#ffffff", fontSize: FONTSIZE.HEADING, align: "center" });
        centerText(this, body, 0, { fill: COLORS.WHITE, fontSize: "16px", align: "justify", wordWrap: { width: 700 } });

        createMenu(this, {
            title: [""],
            options: ["[ RETURN TO TITLE ]"],
            callbacks: [
                () => {
                    if (this.game.globalState?.reset) {
                        this.game.globalState.reset();
                    }

                    // Hide HUD if active
                    if (this.scene.isActive("hud")) {
                        this.scene.setVisible(false, "hud");
                    }

                    this.scene.start("hud");
                    this.scene.start("title_scene");
                }
            ],
            startY: 220,
            gap: 36,
            fontColor: COLORS.WHITE,
            highlightColor: COLORS.ACCENT_ORANGE
        });
    }
}


