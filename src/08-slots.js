import { centerText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { COLORS, OFFSETS, TYPEWRITER_SPEED, MINIGAME_CONFIG } from "../constants.js";


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
            'https://raw.githubusercontent.com/google/fonts/refs/heads/main/ofl/pressstart2p/PressStart2P-Regular.ttf',
            'truetype');
        this.load.audio('youlost', 'assets/sounds/youlost.wav');
        this.load.audio('slotsound', 'assets/sounds/slotsound.wav');
        this.load.audio('slotsmusic', 'assets/sounds/slotsmusic.wav');
        this.load.audio('youwin', 'assets/sounds/youwin.wav');

        // this.load.image("hudbackground", "assets/hudbackground.png");
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.RED);
        this.scene.setVisible(true, 'hud');
        escapeReset(this);
        const backgroundMusic = this.sound.get('backgroundMusic');
        if (backgroundMusic) {
            backgroundMusic.pause();
        }
        this.slotsMusic = this.sound.add('slotsmusic', { loop: true, volume: 0.5 });
        this.slotsMusic.play();
        this.events.once('shutdown', () => {
            this.stopSlotsMusic();
        });



        // Create a filled rectangular frame centered on screen
        const frameGraphics = this.add.graphics();
        const centerX = this.scale.width / 2 - 400;
        const centerY = this.scale.height / 2 - 240;
        frameGraphics.fillStyle(0x1645f5, 0.8); // fill color and alpha
        frameGraphics.fillRect(centerX, centerY, MINIGAME_CONFIG.WIDTH, MINIGAME_CONFIG.HEIGHT);
        frameGraphics.lineStyle(4, 0xffffff, 1); // 4px white border
        frameGraphics.strokeRect(centerX, centerY, MINIGAME_CONFIG.WIDTH, MINIGAME_CONFIG.HEIGHT);


        // Game variables
        this.slot1 = null;
        this.slot2 = null;
        this.slot3 = null;
        this.spinButton = null;
        this.resultText = null;
        this.isSpinning = false;
        this.hasSpun = false;
        this.slotsMusic = this.slotsMusic || null;

        const symbols = ['1', '2', '3', '4', '5', '6'];

        this.titleText = centerText(this, "SPIN TO WIN\nNEIGHBOUR'S SEEDS!", -200, { fill: "#ffffff", fontFamily: "PressStart2P", fontSize: "30px", align: "center" });
        this.titleTween = this.tweens.add({
            targets: this.titleText,
            x: this.titleText.x + 14,
            duration: 400,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1
        });


        // Create slot backgrounds
        const slotWidth = 100;
        const slotHeight = 120;
        const slotY = MINIGAME_CONFIG.HEIGHT / 2 + 140;
        const startX = MINIGAME_CONFIG.WIDTH / 2 - 60;

        // Slot 1
        this.add.rectangle(startX, slotY, slotWidth, slotHeight, 0xffffff);
        this.slot1 = this.add.text(startX, slotY, '?', {
            fontFamily: '"Press Start 2P"',
            fontSize: '40px',
            color: '#000000'
        }).setOrigin(0.5);

        // Slot 2
        this.add.rectangle(startX + 200, slotY, slotWidth, slotHeight, 0xffffff);
        this.slot2 = this.add.text(startX + 200, slotY, '?', {
            fontFamily: '"Press Start 2P"',
            fontSize: '40px',
            color: '#000000'
        }).setOrigin(0.5);

        // Slot 3
        this.add.rectangle(startX + 400, slotY, slotWidth, slotHeight, 0xffffff);
        this.slot3 = this.add.text(startX + 400, slotY, '?', {
            fontFamily: '"Press Start 2P"',
            fontSize: '40px',
            color: '#000000'
        }).setOrigin(0.5);

        // Spin button
        this.spinButton = this.add.rectangle(MINIGAME_CONFIG.WIDTH / 2, MINIGAME_CONFIG.HEIGHT / 2 + 150, 200, 60, 0x000000, 0)
            .setInteractive({ useHandCursor: true })

        this.instructionText = centerText(this, '', 120, {
            fill: '#ffffff',
            fontSize: '14px',
            fontFamily: '"Press Start 2P"',
            wordWrap: { width: MINIGAME_CONFIG.WIDTH * 0.74, useAdvancedWrap: true },
        });
        this.instructionText.setText("[get 3 in a row to get neighbour's seeds]");
        // centerText(this, "[get 3 in a row to get neighbour's seeds]", 105, { fill: "#ffffff", fontFamily: "PressStart2P", fontSize: "14px", align: "center" });

        // Result text

        this.resultText = centerText(this, '', -100, {
            fontSize: '18px',
            align: 'center',
            fontFamily: '"Press Start 2P"',
            fill: '#f0f14e'
        });
        this.resultText.setText('PRESS BUTTON TO SPIN');
        // Button click handler
        this.spinButton.on('pointerdown', () => {
            if (!this.isSpinning && !this.hasSpun) {
                this.spin(symbols);
            }
        });

        // Spacebar handler
        this.input.keyboard.on('keydown-SPACE', () => {
            if (!this.isSpinning && !this.hasSpun) {
                this.spin(symbols);
            }
        });
    }

    spin(symbols) {
        this.hasSpun = true;
        this.isSpinning = true;
        this.resultText.setText('');
        this.sound.play('slotsound');

        // Determine win probability based on neighbor score
        const neighborScore = this.game.globalState.neighborScore;
        let winProbability = 0.1;
        if (neighborScore >= 6) {
            winProbability = 0.6;
        } else if (neighborScore >= 4) {
            winProbability = 0.3;
        } else if (neighborScore >= 2) {
            winProbability = 0.1;
        }

        // Decide if this spin should be a win
        const shouldWin = Math.random() < winProbability;
        let winningSymbol = null;
        if (shouldWin) {
            winningSymbol = symbols[Phaser.Math.Between(0, symbols.length - 1)];
        }

        this.spinCount = 0;
        const maxSpins = 30;

        // Spinning animation
        const spinInterval = this.time.addEvent({
            delay: 100,
            callback: () => {
                if (shouldWin && this.spinCount >= maxSpins - 1) {
                    // On the final spin, set all slots to the winning symbol
                    this.slot1.setText(winningSymbol);
                    this.slot2.setText(winningSymbol);
                    this.slot3.setText(winningSymbol);
                } else {
                    // Normal random spinning
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
            this.sound.play('youwin');

            if (this.game.globalState.certified) {
                this.instructionText.setText("your neighbours offer you their seeds, but they are uncertified and illegal to plant.");
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
                this.instructionText.setText("your neighbours offer you their seeds, but you risk fines as they have been illegally traded");
                createMenu(this, {
                    title: [],
                    options: ["[ ACCEPT AND ILLEGALLY PLANT ]"],
                    callbacks: [
                        () => this.scene.start(this.nextScene),

                    ],
                    startY: 240,
                    gap: 36,
                    fontColor: "#ffffff",
                    highlightColor: "#1645f5"
                });
            }
        } else {
            this.titleTween.stop(); // Remove title text  
            this.titleText.setColor("#ed3833");
            this.titleText.setFontSize("40px");
            this.resultText.setColor("#ed3833");
            this.resultText.setText("your neighbours REFUSED the trade"); // Reset text to original
            this.titleText.setText("MISS");
            this.slot1.setColor("#ed3833");
            this.slot2.setColor("#ed3833");
            this.slot3.setColor("#ed3833");
            this.stopSlotsMusic();
            this.sound.play('youlost');

            this.instructionText.setText("you must resort to planting your old stored seeds illegally, risking fines and criminal charges.");
            createMenu(this, {
                title: [],
                options: ["[ PLANT ILLEGAL SEEDS AND CONTINUE ]"],
                callbacks: [
                    () => {
                        const backgroundMusic = this.sound.get('backgroundMusic');
                        if (backgroundMusic) {
                            backgroundMusic.resume();
                        }
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

        // Reset button
        this.spinButton.setFillStyle(0xffffff, 0);
        this.isSpinning = false;

        // createMenu(this, {
        //     title: [""],
        //     options: ["[ continue ]"],
        //     callbacks: [
        //         () => this.scene.start(this.nextScene, { sourceScene: this.sourceScene }),

        //     ],
        //     startY: 240,
        //     gap: 36,
        //     fontColor: "#ffffff",
        //     highlightColor: "#1645f5"
        // });
    }

    stopSlotsMusic() {
        if (this.slotsMusic && this.slotsMusic.isPlaying) {
            this.slotsMusic.stop();
        }
    }




}