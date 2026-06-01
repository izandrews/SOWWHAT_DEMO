import { centerText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";


export default class season1_planting extends Phaser.Scene {
    constructor() {
        super("season1_planting");
    }

    create() {
        escapeReset(this);
        createMenu(this, {
            title: ["PLANT SEEDS"],
            options: [
                "[ plant seeds ]",
            ],
            callbacks: [
                () => {
                    this.scene.start("planting_minigame", { nextScene: "harvest_transition", sourceScene: "season1_planting" });
                }
            ]
        }
        );
    }
}
