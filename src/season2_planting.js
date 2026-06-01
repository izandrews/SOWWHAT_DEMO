import { centerText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";


export default class season2_planting extends Phaser.Scene {
    constructor() {
        super("season2_planting");
    }

    create() {
        escapeReset(this);
        if (this.game.globalState.certified == false) {
            createMenu(this, {
                title: "Illegal planting detected. Your farm is at risk.",
                options: [
                    "[ plant uncertified seeds ]"],
                callbacks: [
                    () => {
                        this.game.globalState.criminality += 1;
                        this.scene.get('hud').updateStats();
                        this.scene.start("planting_minigame", { nextScene: "season2_warning", sourceScene: "season2_planting" });
                    }
                ]
            });
        } else {
            createMenu(this, {
                title: "Certified seeds must be purchased for this season.",
                options: [
                    "[ purchase and plant seeds -8 gold ]"],
                callbacks: [
                    () => {
                        this.game.globalState.money -= 8;
                        this.scene.get('hud').updateStats();
                        this.scene.start("planting_minigame", { nextScene: "season2_warning", sourceScene: "season2_planting" });
                    }
                ]
            });
        }

    }
}