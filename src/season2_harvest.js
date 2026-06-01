import { centerText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";


export default class season2_harvest extends Phaser.Scene {
    constructor() {
        super("season2_harvest");
    }

    create() {
        escapeReset(this);
        createMenu(this, {
            title: ["The harvest is sold."],
            options: [
                "[ collect profits ]"],
            callbacks: [
                () => {
                    let yieldValue = Math.max(0, this.game.globalState.planting);
                    if (this.game.globalState.certified == true) {
                        yieldValue += 1;
                    }
                    if (this.game.globalState.soilhealthIndex <= 2) {
                        yieldValue = Math.max(0, yieldValue - 1);
                    }
                    if (this.game.globalState.pesticides == false && this.game.globalState.certified == false) {
                        yieldValue = Math.max(0, yieldValue - 1);
                    }
                    this.game.globalState.yield = yieldValue;
                    const pricePerUnit = this.game.globalState.crop === "corn" ? 6 : 5;
                    const profitValue = yieldValue * pricePerUnit;
                    this.game.globalState.money += profitValue;
                    if (this.game.globalState.soilhealthIndex > 0) {
                        this.game.globalState.soilhealthIndex -= 1;
                    }
                    this.scene.get('hud').updateStats();
                    this.scene.start("season2_stats");
                }
            ]
        });
    }
}


