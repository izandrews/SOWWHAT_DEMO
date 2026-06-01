import { centerText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { isButtonPressed, GAMEPAD } from "./gamepad.js";

export default class planting_minigame extends Phaser.Scene {
    constructor() {
        super("planting_minigame");
    }

    preload() {
        this.load.font(
            'PressStart2P',
            'https://raw.githubusercontent.com/google/fonts/refs/heads/main/ofl/pressstart2p/PressStart2P-Regular.ttf',
            'truetype'
        );
    }

    create() {
        escapeReset(this);
        this.cameras.main.setBackgroundColor("#ed3833");

        this.scene.get('hud').updateStats();

        const frameGraphics = this.add.graphics();
        const centerX = this.scale.width / 2 - 400;
        const centerY = this.scale.height / 2 - 240;
        frameGraphics.fillStyle(0x1645f5, 0.8);
        frameGraphics.fillRect(centerX, centerY, 800, 450);
        frameGraphics.lineStyle(4, 0xffffff, 1);
        frameGraphics.strokeRect(centerX, centerY, 800, 450);

        this.hitsNeeded = 3;
        this.hits = 0;
        this.attempts = 0;
        this.roundTimeMs = 7000 - (this.game.globalState.season - 1) * 1000;

        this.timeRemainingMs = this.roundTimeMs;
        this.roundOver = false;

        this.barWidth = Math.min(520, this.scale.width * 0.72);
        this.barHeight = 28;
        this.barX = (this.scale.width - this.barWidth) / 2;
        this.barY = this.scale.height * 0.52;

        this.sweetSpotWidth = this.barWidth * 0.17;
        this.sweetSpotX = this.randomSweetSpotX();

        this.markerX = this.barX;
        this.markerDirection = 1;
        this.markerSpeed = this.barWidth * 1.05;

        this.selectWasDown = false;

        centerText(this, "SEED PLANTING", -200, {
            fill: "#ffffff",
            fontFamily: "PressStart2P",
            fontSize: "30px"
        });

        centerText(this, "PRESS BUTTON WHEN DOT IS IN GREEN ZONE", -105, {
            fill: "COLORS.BLACK",
            fontSize: "18px",
            align: "center"
        });

        this.graphics = this.add.graphics();

        this.statsText = this.add.text(this.scale.width / 2, this.barY + 70, "", {
            fontFamily: "PressStart2P",
            fontSize: "13px",
            fill: "#ffffff",
            align: "center"
        }).setOrigin(0.5, 0);

        this.statusText = this.add.text(this.scale.width / 2, this.barY + 115, "", {
            fontFamily: "PressStart2P",
            fontSize: "13px",
            fill: "#ffffff",
            align: "center"
        }).setOrigin(0.5, 0);

        this.updateHudText("land 3 good hits before timer ends");
        this.redrawBar();

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.onSpaceDown = () => this.tryHit();
        this.spaceKey.on("down", this.onSpaceDown);

        this.timer = this.time.addEvent({
            delay: 50,
            loop: true,
            callback: () => {
                if (this.roundOver) return;
                this.timeRemainingMs = Math.max(0, this.timeRemainingMs - 50);
                this.updateHudText(this.statusText.text || "");
                if (this.timeRemainingMs <= 0) {
                    this.finishRound();
                }
            }
        });

        this.events.once("shutdown", () => this.cleanupInput());
        this.events.once("destroy", () => this.cleanupInput());
    }

    update(_, delta) {
        if (this.roundOver) return;

        const selectDown = isButtonPressed(this, GAMEPAD.SELECT_BUTTON);

        if (selectDown && !this.selectWasDown) {
            this.tryHit();
        }

        this.selectWasDown = selectDown;

        this.markerX += this.markerDirection * this.markerSpeed * (delta / 700);

        if (this.markerX >= this.barX + this.barWidth) {
            this.markerX = this.barX + this.barWidth;
            this.markerDirection = -1;
        } else if (this.markerX <= this.barX) {
            this.markerX = this.barX;
            this.markerDirection = 1;
        }

        this.redrawBar();
    }

    randomSweetSpotX() {
        return Phaser.Math.Between(
            this.barX,
            Math.floor(this.barX + this.barWidth - this.sweetSpotWidth)
        );
    }

    isMarkerInsideSweetSpot() {
        return this.markerX >= this.sweetSpotX &&
            this.markerX <= this.sweetSpotX + this.sweetSpotWidth;
    }

    tryHit() {
        if (this.roundOver) return;

        this.attempts += 1;

        if (this.isMarkerInsideSweetSpot()) {
            this.hits += 1;
            this.statusText.setText("HIT");
            this.statusText.setFill("#33ff00");
            this.sweetSpotX = this.randomSweetSpotX();
        } else {
            this.statusText.setText("MISS");
            this.statusText.setFill("#ed3833");
        }

        this.updateHudText(this.statusText.text);
        this.redrawBar();

        if (this.hits >= this.hitsNeeded) {
            this.time.delayedCall(250, () => this.finishRound());
        }
    }

    updateHudText(status) {
        const secondsLeft = Math.max(0, Math.ceil(this.timeRemainingMs / 1000));
        this.statsText.setText(`hits: ${this.hits}/${this.hitsNeeded}     time: ${secondsLeft}s`);
        if (status) {
            this.statusText.setText(status);
        }
    }

    redrawBar() {
        this.graphics.clear();

        this.graphics.fillStyle(0x222222, 1);
        this.graphics.fillRect(this.barX - 4, this.barY - 4, this.barWidth + 8, this.barHeight + 8);

        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRect(this.barX, this.barY, this.barWidth, this.barHeight);

        this.graphics.fillStyle(0x33ff00, 1);
        this.graphics.fillRect(this.sweetSpotX, this.barY, this.sweetSpotWidth, this.barHeight);

        this.graphics.fillStyle(0x222222, 1);
        this.graphics.fillCircle(this.markerX, this.barY + this.barHeight / 2, 10);
    }

    finishRound() {
        this.game.globalState.planting = 0;

        if (this.roundOver) return;

        this.roundOver = true;
        this.cleanupInput();

        let result = "BAD PLANTING";

        if (this.hits >= this.hitsNeeded) {
            if (this.attempts === this.hitsNeeded) {
                result = "GOOD";
                this.game.globalState.planting += 3;
            } else if (this.attempts <= this.hitsNeeded + 2) {
                result = "OKAY";
                this.game.globalState.planting += 2;
            } else {
                result = "BAD";
                this.game.globalState.planting += 1;
            }
        } else if (this.hits >= 2) {
            result = "BAD";
            this.game.globalState.planting += 1;
        }

        centerText(this, result, 165, {
            fill: "#ffffff",
            fontSize: "20px",
            align: "center"
        });

        createMenu(this, {
            title: [""],
            options: ["[ CONTINUE ]"],
            callbacks: [
                () => this.scene.start("season3_choice")
            ],
            startY: 240,
            gap: 36,
            fontColor: "#ffffff",
            highlightColor: "#1645f5"
        });
    }

    cleanupInput() {
        if (this.spaceKey && this.onSpaceDown) {
            this.spaceKey.off("down", this.onSpaceDown);
        }

        if (this.timer) {
            this.timer.remove(false);
            this.timer = null;
        }
    }
}