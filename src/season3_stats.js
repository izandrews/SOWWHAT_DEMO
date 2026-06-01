import { centerText, createTypewriterText} from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { COLORS, TYPEWRITER_SPEED } from "../constants.js";


export default class season3_stats extends Phaser.Scene {
    constructor() {
        super("season3_stats");
    }
    create() {
    escapeReset(this);

    this.cameras.main.setBackgroundColor(COLORS.PRIMARY_BLUE);

    const planting = Math.max(0, this.game.globalState.planting);
    centerText(this, "SEASON 3 STATS.", -80, {fill: COLORS.ACCENT_ORANGE, fontSize: "30px", fontFamily: 'PressStart2P', align: "center"},);
    createTypewriterText(
        this,
        "\n\nMONEY: " + this.game.globalState.money + "\nYIELD: " + planting + "\nSOIL HEALTH: " + this.game.globalState.soilhealth + "\nNEIGHBOR SCORE: " + this.game.globalState.neighborScore,
        0,
        {fill: COLORS.ACCENT_ORANGE},
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
                    this.scene.start("season4_collapse");
                }
            ],
        fontColor: COLORS.WHITE, // normal option color (white)
        highlightColor: COLORS.ACCENT_ORANGE // highlighted option color (orange)
        });
    }
);
}
}
