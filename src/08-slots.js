import { centerText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { COLORS, MINIGAME_CONFIG } from "../constants.js";
import { isButtonPressed, GAMEPAD } from "./gamepad.js";
import { MUSIC_VOLUME } from "./audioConstants.js";

export default class trade_slots extends Phaser.Scene {
    constructor() {
        super("trade_slots");
    }

    init(data) {
        this.nextScene = data?.nextScene || "inspector_encounter";
        this.sourceScene = data?.sourceScene || null;
    }

    preload() {
        this.load.font(
            'PressStart2P',
            '../assets/PressStart2P-Regular.ttf',
            'truetype'
        );
        this.load.audio('youlost', 'assets/sounds/youlost.wav');
        this.load.audio('slotsound', 'assets/sounds/slotsound.wav');
        this.load.audio('slotsmusic', 'assets/sounds/slotsmusic.wav');
        this.load.audio('youwin', 'assets/sounds/youwin.wav');
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.RED);
        this.scene.setVisible(true, 'hud');
        escapeReset(this);
        const backgroundMusic = this.sound.get('backgroundMusic');
        if (backgroundMusic) {
            backgroundMusic.pause();
        }
        this.slotsMusic = this.sound.add('slotsmusic', { loop: true, volume: MUSIC_VOLUME });
        this.slotsMusic.play();
        this.events.once('shutdown', () => {
            this.stopSlotsMusic();
        });

        const frameGraphics = this.add.graphics();
        const centerX = this.scale.width / 2 - 400;
        const centerY = this.scale.height / 2 - 240;
        const frameCenterX = centerX + MINIGAME_CONFIG.WIDTH / 2;
        const frameCenterY = centerY + MINIGAME_CONFIG.HEIGHT / 2;

        frameGraphics.fillStyle(0x1645f5, 0.8);
        frameGraphics.fillRect(centerX, centerY, MINIGAME_CONFIG.WIDTH, MINIGAME_CONFIG.HEIGHT);
        frameGraphics.lineStyle(4, 0xffffff, 1);
        frameGraphics.strokeRect(centerX, centerY, MINIGAME_CONFIG.WIDTH, MINIGAME_CONFIG.HEIGHT);

        this.slot1 = null;
        this.slot2 = null;
        this.slot3 = null;
        this.spinButton = null;
        this.resultText = null;
        this.isSpinning = false;
        this.hasSpun = false;
        this.selectWasDown = isButtonPressed(this, GAMEPAD.SELECT_BUTTON);

        const symbols = ['1', '2', '3', '4', '5', '6'];

        this.titleText = centerText(this, "SPIN TO WIN\nNEIGHBOUR'S SEEDS!", -200, {
            fill: "#ffffff",
            fontFamily: "PressStart2P",
            fontSize: "30px",
            align: "center"
        });

        this.titleTween = this.tweens.add({
            targets: this.titleText,
            x: this.titleText.x + 14,
            duration: 400,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1
        });

        const slotWidth = 100;
        const slotHeight = 120;
        const slotY = MINIGAME_CONFIG.HEIGHT / 2 + 140;
        const startX = frameCenterX - 200;

        this.add.rectangle(startX, slotY, slotWidth, slotHeight, 0xffffff);
        this.slot1 = this.add.text(startX, slotY, '?', {
            fontFamily: '"PressStart2P"',
            fontSize: '40px',
            color: '#000000'
        }).setOrigin(0.5);

        this.add.rectangle(startX + 200, slotY, slotWidth, slotHeight, 0xffffff);
        this.slot2 = this.add.text(startX + 200, slotY, '?', {
            fontFamily: '"PressStart2P"',
            fontSize: '40px',
            color: '#000000'
        }).setOrigin(0.5);

        this.add.rectangle(startX + 400, slotY, slotWidth, slotHeight, 0xffffff);
        this.slot3 = this.add.text(startX + 400, slotY, '?', {
            fontFamily: '"PressStart2P"',
            fontSize: '40px',
            color: '#000000'
        }).setOrigin(0.5);

        this.spinButton = this.add.rectangle(
            frameCenterX,
            MINIGAME_CONFIG.HEIGHT / 2 + 150,
            200,
            60,
            0x000000,
            0
        ).setInteractive({ useHandCursor: true });

        this.instructionText = centerText(this, '', 120, {
            fill: '#ffffff',
            fontSize: '14px',
            fontFamily: '"PressStart2P"',
            wordWrap: { width: MINIGAME_CONFIG.WIDTH * 0.74, useAdvancedWrap: true },
        });

        this.instructionText.setText("[get 3 in a row to get neighbour's seeds]");

        this.resultText = centerText(this, '', -100, {
            fontSize: '18px',
            align: 'center',
            fontFamily: '"PressStart2P"',
            fill: "COLORS.BLACK"
        });

        this.resultText.setText('PRESS BUTTON TO SPIN');

        this.spinButton.on('pointerdown', () => this.trySpin(symbols));

        this.input.keyboard.on('keydown-SPACE', () => this.trySpin(symbols));
    }

    update() {
        const selectDown = isButtonPressed(this, GAMEPAD.SELECT_BUTTON);

        if (selectDown && !this.selectWasDown) {
            this.trySpin(['1', '2', '3', '4', '5', '6']);
        }

        this.selectWasDown = selectDown;
    }

    trySpin(symbols) {
        if (!this.isSpinning && !this.hasSpun) {
            this.spin(symbols);
        }
    }

    spin(symbols) {
        this.hasSpun = true;
        this.isSpinning = true;
        this.resultText.setText('');
        this.sound.play('slotsound', { volume: MUSIC_VOLUME });

        const neighborScore = this.game.globalState.neighborScore;

        let winProbability = 0.1;

        if (neighborScore >= 6) {
            winProbability = 0.6;
        } else if (neighborScore >= 4) {
            winProbability = 0.3;
        } else if (neighborScore >= 2) {
            winProbability = 0.1;
        }

        const shouldWin = Math.random() < winProbability;

        let winningSymbol = null;

        if (shouldWin) {
            winningSymbol = symbols[Phaser.Math.Between(0, symbols.length - 1)];
        }

        this.spinCount = 0;
        const maxSpins = 30;

        const spinInterval = this.time.addEvent({
            delay: 100,
            callback: () => {
                if (shouldWin && this.spinCount >= maxSpins - 1) {
                    this.slot1.setText(winningSymbol);
                    this.slot2.setText(winningSymbol);
                    this.slot3.setText(winningSymbol);
                } else {
                    this.slot1.setText(symbols[Phaser.Math.Between(0, symbols.length - 1)]);
                    this.slot2.setText(symbols[Phaser.Math.Between(0, symbols.length - 1)]);
                    this.slot3.setText(symbols[Phaser.Math.Between(0, symbols.length - 1)]);
                }

                this.spinCount++;

                if (this.spinCount >= maxSpins) {
                    spinInterval.remove();
                    this.checkResult();
                }
            },
            loop: true
        });
    }

    checkResult() {
        const symbol1 = this.slot1.text;
        const symbol2 = this.slot2.text;
        const symbol3 = this.slot3.text;

        if (symbol1 === symbol2 && symbol2 === symbol3) {
            this.resultText.setText("HIT! your neighbors ACCEPTED the trade");
            this.resultText.setColor("#33ff00");
            this.slot1.setColor("#33ff00");
            this.slot2.setColor("#33ff00");
            this.slot3.setColor("#33ff00");
            this.stopSlotsMusic();
            this.sound.play('youwin', { volume: .2 });

            if (this.game.globalState.certified) {
                this.instructionText.setText("your neighbours offer you their seeds, but they are uncertified and illegal to plant.");
            } else {
                this.instructionText.setText("your neighbours offer you their seeds, but you risk fines as they have been illegally traded");
            }

            createMenu(this, {
                title: [""],
                options: ["[ ACCEPT AND ILLEGALLY PLANT ]"],
                callbacks: [
                    () => this.scene.start(this.nextScene),
                ],
                startY: 240,
                gap: 36,
                fontColor: "#ffffff",
                highlightColor: "#1645f5"
            });
        } else {
            this.titleTween.stop();
            this.titleText.setColor("#ed3833");
            this.titleText.setFontSize("40px");
            this.resultText.setColor("#ed3833");
            this.resultText.setText("your neighbours REFUSED the trade");
            this.titleText.setText("MISS");
            this.slot1.setColor("#ed3833");
            this.slot2.setColor("#ed3833");
            this.slot3.setColor("#ed3833");
            this.stopSlotsMusic();
            this.sound.play('youlost', { volume: 0.2 });

            this.instructionText.setText("you must resort to planting your old stored seeds illegally, risking fines and criminal charges.");

            createMenu(this, {
                title: [],
                options: ["[ PLANT ILLEGAL SEEDS AND CONTINUE ]"],
                callbacks: [
                    () => {
                        const backgroundMusic = this.sound.get('backgroundMusic');
                        if (backgroundMusic) backgroundMusic.resume({ volume: 0.5 });

                        this.game.globalState.fines += 20;
                        this.game.globalState.criminality += 2;
                        this.scene.get('hud').updateStats();
                        this.scene.start(this.nextScene);
                    },
                ],
                startY: 240,
                gap: 36,
                fontColor: "#ffffff",
                highlightColor: "#1645f5"
            });
        }

        this.spinButton.setFillStyle(0xffffff, 0);
        this.isSpinning = false;
    }

    stopSlotsMusic() {
        if (this.slotsMusic && this.slotsMusic.isPlaying) {
            this.slotsMusic.stop();
        }
    }
}