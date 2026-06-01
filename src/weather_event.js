import { centerText, createTypewriterText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { COLORS, OFFSETS, TYPEWRITER_SPEED } from "../constants.js";


export default class weather_event extends Phaser.Scene {
    constructor() {
        super("weather_event");
    }
    preload() {
        // Load assets for the next scene here
        this.load.spritesheet('clock', 'assets/clock.png', {
            frameWidth: 80,  // width of each frame
            frameHeight: 110  // height of each frame
        });
    }

    create() {
        this.cameras.main.setBackgroundColor("#ed3833");
        escapeReset(this);
        this.uppertext = centerText(this, "local forecast:", -190, { fill: COLORS.BLACK });
        this.waitingText = centerText(this, "\n\nwaiting for crops to grow...", 70, { fill: COLORS.BLACK });
        const weather = Math.random() < 0.5 ? "SEVERE HEATWAVE" : "FLASH FLOODING!";
        const forecastText = centerText(
            this,
            `${weather}`,
            -150,
            { fill: COLORS.BLACK, fontSize: "32px" }
        );


        this.tweens.add({
            targets: forecastText,
            alpha: 0,
            duration: 600,
            yoyo: true,
            repeat: 3
        });
        this.anims.create({
            key: 'clock_anim',
            frames: this.anims.generateFrameNumbers('clock', { start: 1, end: 11 }),
            frameRate: 6,
            repeat: 2 // play once
        });
        const sprite = this.add.sprite(window.innerWidth / 2, window.innerHeight / 2, "clock");
        sprite.play('clock_anim');
        sprite.setScale(1.5);

        sprite.on('animationcomplete', () => {
            this.waitingText.destroy();
            sprite.destroy();
            forecastText.destroy();
            this.uppertext.destroy();
            
            this.cameras.main.setBackgroundColor(COLORS.ACCENT_ORANGE);

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
                title: "",
                options: [
                    "[ continue to harvest ]"],
                callbacks: [
                    () => this.scene.start("market_sale")],
                fontColor: COLORS.WHITE, // normal option color (white)
                highlightColor: COLORS.PRIMARY_BLUE // highlighted option color (orange)
            }
            );
        });
    }
    // Ensure update is called for menu input
    // update(time, delta) {
    //     if (typeof this.update === 'function' && this.update !== scene15.prototype.update) {
    //         this.update(time, delta);
    //     }
    // }
}
