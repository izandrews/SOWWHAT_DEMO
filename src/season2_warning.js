import { centerText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";


export default class season2_warning extends Phaser.Scene {
    constructor() {
        super("season2_warning");
    }

    create() {
        escapeReset(this);
        createMenu(this, {
            title: "Pest outbreaks expected this season.",
            options: [
                "[ continue ]"],
            callbacks: [
                () => {
                    this.scene.start("season2_wait");
                }
            ]
        });
    }
}


