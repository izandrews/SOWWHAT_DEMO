import { centerText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";


export default class uncertified_market extends Phaser.Scene {
    constructor() {
        super("uncertified_market");
    }

    create() {
        escapeReset(this);
        // centerText(this, "");
        createMenu(this, {
            title: ["THEN GROCERY STORE REFUSES TO BUY UNCERTIFIED PRODUCE.\n\nyou must sell at the local market."],
            options: [
                "[ sell at local market ]",
            ],
            callbacks: [
                () => {
                    const planting = Math.max(0, this.game.globalState.planting);
                    const profitValue = planting * 3;
                    this.game.globalState.money += profitValue;
                    this.scene.get('hud').updateStats();
                    this.scene.start("season3_stats");
                }
            ]
        })
    }
}


