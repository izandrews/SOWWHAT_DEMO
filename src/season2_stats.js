import { centerText, createTypewriterText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { COLORS, TYPEWRITER_SPEED, FONTSIZE } from "../constants.js";


export default class season2_stats extends Phaser.Scene {
    constructor() {
        super("season2_stats");
    }
    create() {
        escapeReset(this);

        this.cameras.main.setBackgroundColor(COLORS.PRIMARY_BLUE);
        const planting = Math.max(0, this.game.globalState.planting);
        this.game.globalState.yield = planting;
        centerText(this, "SEASON 2 STATS.", -80, { fill: COLORS.ACCENT_ORANGE, fontSize: FONTSIZE.HEADING, fontFamily: 'PressStart2P', align: "center" });
        createTypewriterText(
            this,
            "\n\nMONEY: " + this.game.globalState.money + "\nYIELD: " + planting + "\nNEIGHBOR TRUST: " + this.game.globalState.neighborScore + "\nSOIL HEALTH: " + this.game.globalState.soilhealth + "\nCRIMINALITY: " + this.game.globalState.criminality,
            0,
            { fill: COLORS.ACCENT_ORANGE },
            TYPEWRITER_SPEED.FAST,
            () => {
                createMenu(this, {
                    title: [""],
                    options: [
                        "[ continue to NEXT SEASON ]",
                    ],
                    callbacks: [
                        () => {
                            this.scene.get('hud').updateStats();
                            this.scene.start("season3_intro");
                        }
                    ],
                    fontColor: COLORS.WHITE, // normal option color (white)
                    highlightColor: COLORS.ACCENT_ORANGE // highlighted option color (orange)
                });
            }
        );
    }
}
