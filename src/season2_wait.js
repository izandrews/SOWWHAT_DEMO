import { centerText, createTypewriterText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { COLORS, TYPEWRITER_SPEED } from "../constants.js";


export default class season2_wait extends Phaser.Scene {
    constructor() {
        super("season2_wait");
    }

    preload() {
        // Load assets for the next scene here
        this.load.spritesheet('clock', 'assets/clock.png', {
            frameWidth: 80,  // width of each frame
            frameHeight: 110  // height of each frame
        });
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.PRIMARY_BLUE);
        escapeReset(this);
        centerText(this, "waiting for crops to grow...", -140, { fill: COLORS.BLACK });
        const weather = Math.random() < 0.5 ? "MODERATE RAINSTORMS" : "MILD DROUGHT CONDITIONS";
        createTypewriterText(
            this,
            `\n\nlocal weather forecast: ${weather}. take precautions and stay safe out there folks!`, 70, { fill: COLORS.ACCENT_ORANGE }, TYPEWRITER_SPEED.FAST);
        this.anims.create({
            key: 'clock_anim',
            frames: this.anims.generateFrameNumbers('clock', { start: 1, end: 11 }),
            frameRate: 6,
            repeat: 1 // play once
        });
        const sprite = this.add.sprite(window.innerWidth / 2, window.innerHeight / 2, "clock");
        sprite.play('clock_anim');
        sprite.setScale(1.5);

        sprite.on('animationcomplete', () => {
            sprite.destroy();
            createMenu(this, {
                title: "",
                options: [
                    "[ continue to harvest ]"],
                callbacks: [
                    () => this.scene.start("season2_harvest")],
                fontColor: COLORS.WHITE, // normal option color (white)
                highlightColor: COLORS.ACCENT_ORANGE // highlighted option color (orange)
            }
            );
        });
    }
    // Ensure update is called for menu input
    // update(time, delta) {
    //     if (typeof this.update === 'function' && this.update !== scene10.prototype.update) {
    //         this.update(time, delta);
    //     }
    // }
}
