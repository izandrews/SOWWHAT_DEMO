import { centerText, createTypewriterText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { COLORS, TYPEWRITER_SPEED } from "../constants.js";


export default class season1_stats extends Phaser.Scene {
    constructor() {
        super("season1_stats");
    }
    create() {
        escapeReset(this);

        this.cameras.main.setBackgroundColor(COLORS.PRIMARY_BLUE);
        const planting = Math.max(0, this.game.globalState.planting);
        const crop = this.game.globalState.crop;
        const pricePerUnit = crop === "corn" ? 5 : 4;
        const yieldValue = planting;
        const profitValue = planting * pricePerUnit;
        this.game.globalState.yield = yieldValue;
        this.game.globalState.money += profitValue;

        centerText(this, "SEASON 1 STATS.", -80, { fill: COLORS.ACCENT_ORANGE, fontSize: "30px", fontFamily: 'PressStart2P', align: "center" });
        createTypewriterText(
            this,
            "\n\nMONEY: " + this.game.globalState.money + "\nYIELD: " + yieldValue + "\nPROFIT: " + profitValue + "\nNEIGHBOR TRUST: " + this.game.globalState.neighborScore + "\nSOIL HEALTH: " + this.game.globalState.soilhealth + "\nCRIMINALITY: " + this.game.globalState.criminality,
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
                            this.scene.start("seedlaw_announcement");
                        }
                    ],
                    fontColor: COLORS.WHITE, // normal option color (white)
                    highlightColor: COLORS.ACCENT_ORANGE // highlighted option color (orange)
                });
            }
        );
    }
}
