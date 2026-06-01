import { centerText, createTypewriterText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { OFFSETS, TYPEWRITER_SPEED } from "../constants.js";


export default class market_sale extends Phaser.Scene {
    constructor() {
        super("market_sale");
    }


    create() {
        escapeReset(this);
        centerText(this, "POOR HARVEST", OFFSETS.SEASON_TITLE_Y, { fontSize: "32px" });

        let titleMessage;
        if (this.game.globalState.soilhealthIndex <= 2) {
            titleMessage = "\n\nyour yield is low this season due to weather conditions and your " + this.game.globalState.soilhealth + " soil health.";
        } else if (this.game.globalState.planting <= 2) {
            titleMessage = "\n\nyour yield is low this season due to weather conditions and poor planting.";
        }
        else if (this.game.globalState.pesticides == false) {
            titleMessage = "\n\nyour yield is low this season due to weather conditions and pest damage.";
        } else {
            titleMessage = "\n\nyour yield is low this season due to weather conditions.";
        };
        this.title = createTypewriterText(this, titleMessage, 0, {}, TYPEWRITER_SPEED.FAST);
        this.tweens.add({
            targets: this.title,

            duration: 600,
            yoyo: true,
            repeat: 3
        });

        createMenu(this, {

            options: [
                "[ sell at new grocery store ]",
                "[ sell at local market ]",
            ],
            callbacks: [
                () => {
                    const planting = Math.max(0, this.game.globalState.planting);
                    const crop = this.game.globalState.crop;
                    const groceryPrice = crop === "corn" ? 6 : 5;
                    const profitValue = planting * groceryPrice;
                    if (this.game.globalState.certified == false) {
                        this.scene.start("uncertified_market");
                        return;
                    } else {
                        this.game.globalState.money += profitValue;
                        this.game.globalState.neighborScore -= 2;
                    }
                    this.scene.get('hud').updateStats();
                    this.scene.start("season3_stats");
                },
                () => {
                    const planting = Math.max(0, this.game.globalState.planting);
                    const crop = this.game.globalState.crop;
                    const marketPrice = crop === "corn" ? 4 : 3;
                    const profitValue = planting * marketPrice;
                    this.game.globalState.money += profitValue;
                    if (this.game.globalState.crop == "cowpea") {
                        this.game.globalState.neighborScore += 2;
                    } else if (this.game.globalState.crop == "corn") {
                        this.game.globalState.neighborScore += 1;
                    }

                    this.scene.get('hud').updateStats();
                    this.scene.start("season3_stats");
                }]
        })
    }
}


