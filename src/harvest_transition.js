import { centerText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";


export default class harvest_transition extends Phaser.Scene {
    constructor() {
        super("harvest_transition");
    }
    preload() {
        // Load assets for the next scene here
        this.load.spritesheet('clock', 'assets/clock.png', {
            frameWidth: 80,  // width of each frame
            frameHeight: 110  // height of each frame
        });    }
    create() {
    this.scene.bringToTop('hud');
        this.cameras.main.setBackgroundColor("#1645f5");
        escapeReset(this);
        this.anims.create({
            key: 'clock_anim',
            frames: this.anims.generateFrameNumbers('clock', { start: 1, end: 11 }),
            frameRate: 6,
            repeat: 1 // play once
        });
        const sprite = this.add.sprite(this.cameras.main.width/2, this.cameras.main.height/2, "clock");
        sprite.play('clock_anim');
        sprite.setScale(1.5);

        sprite.on('animationcomplete', () => {
            sprite.destroy();
            createMenu(this, {
                title: "your harvest is ready. click to view your yield.",
                options: [
                    "[ view season 1 stats ]",
                ],
                callbacks: [
                    () => {
                        this.scene.start("season1_stats");
                    }
                ],
                fontColor: "#ffffff", // normal option color (white)
                highlightColor: "#ffb000" // highlighted option color (orange)
            });
        });
    }
    // Ensure update is called for menu input
    update(time, delta) {
        if (typeof this.update === 'function' && this.update !== harvest_transition.prototype.update) {
            this.update(time, delta);
        }
    }
}
