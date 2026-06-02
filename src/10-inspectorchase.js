import { centerText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { MUSIC_VOLUME } from "./audioConstants.js";

export default class inspection_chase extends Phaser.Scene {
    constructor() {
        super("inspection_chase");
    }

    // init(data) {
    //     this.nextScene = data?.nextScene || "police_encounter";
    //     this.sourceScene = data?.sourceScene || null;
    // }
    preload() {
        // this.load.image('ground', 'assets/ground.png');
        this.load.atlas('farmer', 'assets/farmer.png', 'assets/farmer.json');
        this.load.atlas('inspector', 'assets/inspector.png', 'assets/inspector.json');
        this.load.image('rock', 'assets/rock.png');
        this.load.audio('runjump_background', 'assets/sounds/runjump_background.wav');
        this.load.audio('youlost', 'assets/sounds/youlost.wav');
        this.load.audio('youwin', 'assets/sounds/youwin.wav');

        // this.load.spritesheet('cassava', 'assets/crops/cassava.png', {
        //     frameWidth: 64,  // width of each frame
        //     frameHeight: 82  // height of each frame
        // });
    }

    create() {
        escapeReset(this);
        this.cameras.main.setBackgroundColor("#ed3833");

        const backgroundMusic = this.sound.get('backgroundMusic');
        if (backgroundMusic) {
            backgroundMusic.pause();
        }
        this.chaseMusic = this.sound.add('runjump_background', { loop: true, volume: MUSIC_VOLUME });
        this.chaseMusic.play();
        this.events.once('shutdown', () => {
            this.chaseMusic.stop();
        });
        // this.sound.play('runjump_background', { loop: true, volume: MUSIC_VOLUME });

        // Create a filled rectangular frame centered on screen
        const frameGraphics = this.add.graphics();
        const centerX = this.scale.width / 2 - 400;
        const centerY = this.scale.height / 2 - 240;
        this.frameX = centerX;
        this.frameY = centerY;
        this.frameWidth = 800;
        this.frameHeight = 450;
        frameGraphics.fillStyle(0x1645f5, 0.8); // fill color and alpha
        frameGraphics.fillRect(this.frameX, this.frameY, this.frameWidth, this.frameHeight);
        frameGraphics.lineStyle(4, 0xffffff, 1); // 4px white border
        frameGraphics.strokeRect(this.frameX, this.frameY, this.frameWidth, this.frameHeight);

        centerText(this, "ESCAPE THE INSPECTOR!", -200, { fill: "#ffffff", fontFamily: "PressStart2P", fontSize: "30px", align: "center" });


        this.jumpKeyPressTime = 0;
        this.isJumping = false;
        this.lastSpawnTime = 0;
        this.spawnIntervalMin = 260;
        this.spawnIntervalMax = 1300;
        this.spawnInterval = 900;
        this.obstacleYOffset = 8;
        this.inspectorJumpVelocity = -600;
        this.inspectorJumpTriggerDistance = 30;
        this.inspectorJumpCooldownMs = 220;
        this.inspectorLastJumpTime = -9999;
        this.gameIsOver = false;

        // Enable physics for this scene
        this.physics.world.gravity.y = 2550;

        // Create ground inside frame
        const groundWidth = this.frameWidth;
        const groundHeight = 40;
        const groundX = this.frameX + this.frameWidth / 2;
        const groundY = this.frameY + this.frameHeight - groundHeight / 2;

        this.ground = this.add.rectangle(groundX, groundY, groundWidth, groundHeight, 0xffffff);
        this.ground.setStrokeStyle(2, 0x000000);
        this.physics.add.existing(this.ground, true); // true = static body

        this.gravity = 1350;

        this.farmer = this.add.sprite(this.frameX + 155, groundY - 150, 'farmer', 'farmer 0.png');
        this.physics.add.existing(this.farmer);
        // setSize: hitbox dimensions. setOffset: shifts hitbox toward bottom of sprite,
        // raising the farmer's visual position without changing where it sits on the ground.
        this.farmer.body.setSize(36, 70);
        this.farmer.body.setOffset(22, 40);
        this.physics.add.collider(this.farmer, this.ground);

        // Create animation if it doesn't exist
        if (!this.anims.exists('farmerWalk')) {
            this.anims.create({
                key: 'farmerWalk',
                frames: this.anims.generateFrameNames('farmer', {
                    prefix: 'farmer ',
                    suffix: '.png',
                    start: 0,
                    end: 3
                }),
                frameRate: 10,
                repeat: -1
            });
        }

        this.farmer.play('farmerWalk');

        // this.inspector = this.add.rectangle(this.frameX + 60, groundY - 45, 30, 50, 0xff0000);
        // this.physics.add.existing(this.inspector);
        // this.inspector.body.setSize(30, 50);
        // this.inspector.body.setCollideWorldBounds(true);
        // this.physics.add.collider(this.inspector, this.ground);



        this.inspector = this.add.sprite(this.frameX + 60, groundY - 250, 'inspector', 'inspector 0.png');
        this.physics.add.existing(this.inspector);
        // setSize: hitbox dimensions. setOffset: shifts hitbox toward bottom of sprite,
        // raising the farmer's visual position without changing where it sits on the ground.
        this.inspector.body.setSize(36, 70);
        this.inspector.body.setOffset(22, 60);
        this.physics.add.collider(this.inspector, this.ground);

        // Create animation if it doesn't exist
        if (!this.anims.exists('inspectorWalk')) {
            this.anims.create({
                key: 'inspectorWalk',
                frames: this.anims.generateFrameNames('inspector', {
                    prefix: 'inspector ',
                    suffix: '.png',
                    start: 0,
                    end: 3
                }),
                frameRate: 10,
                repeat: -1
            });
        }

        this.inspector.play('inspectorWalk');

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        this.obstacles = this.physics.add.group();
        this.physics.add.collider(this.farmer, this.obstacles, this.gameOver, null, this);

        this.startTime = this.time.now;
        this.lastSpawnTime = this.time.now;
    }

    update() {
        const jumpPressed = this.cursors.space.isDown || this.wKey.isDown || this.cursors.up.isDown;

        // Start jump if key pressed, farmer grounded, and not already jumping

        if (this.farmer && this.farmer.body && jumpPressed && this.farmer.body.touching.down && !this.isJumping) {
            this.farmer.body.setVelocityY(-650);
            this.isJumping = true;
            console.log("Jumped!");
        }
        // if (this.farmer && this.farmer.body && jumpPressed && this.farmer.body.touching.down && !this.isJumping) {
        //     this.jumpKeyPressTime = this.time.now;
        //     this.isJumping = true;
        //     console.log("Jump started!");
        // }

        // // Apply upward impulse while key is held and within 1 second
        // if (this.farmer && this.farmer.body && jumpPressed && this.isJumping) {
        //     const holdDuration = this.time.now - this.jumpKeyPressTime;
        //     if (holdDuration <= 150) {
        //         // Apply upward impulse each frame (constant velocity while held)
        //         this.farmer.body.velocity.y = -500;
        //     } else {
        //         this.isJumping = false;
        //     }
        // } else if (this.isJumping && !jumpPressed) {
        //     // Stop jumping when key is released
        //     this.isJumping = false;
        // }

        // Reset jump state when farmer touches ground
        if (this.farmer && this.farmer.body && this.farmer.body.touching.down && !jumpPressed) {
            this.isJumping = false;
        }

        // Spawn obstacles at intervals
        if (!this.gameIsOver && this.time.now - this.lastSpawnTime >= this.spawnInterval) {
            this.spawnObstacle();
            this.lastSpawnTime = this.time.now;
            const elapsedSeconds = (this.time.now - this.startTime) / 1000;
            const difficulty = Phaser.Math.Clamp(elapsedSeconds / 40, 0, 1);
            const aggressiveRamp = Math.pow(difficulty, 1.8);
            // Early game stays forgiving; last third ramps down interval quickly.
            const currentMaxInterval = Phaser.Math.Linear(this.spawnIntervalMax, this.spawnIntervalMin + 200, aggressiveRamp);
            const currentMinInterval = Phaser.Math.Linear(this.spawnIntervalMin + 350, this.spawnIntervalMin, aggressiveRamp);
            this.spawnInterval = Phaser.Math.Between(Math.floor(currentMinInterval), Math.floor(currentMaxInterval));
        }

        this.autoJumpInspector();

        this.obstacles.children.iterate(obstacle => {
            if (obstacle && obstacle.x < this.frameX + 40) {
                obstacle.destroy();
            }
        });

        const elapsed = (this.time.now - this.startTime) / 1000;
        if (!this.gameIsOver && elapsed >= 40) {
            this.winGame();
        }

    }

    spawnObstacle() {
        const elapsedSeconds = (this.time.now - this.startTime) / 1000;
        const difficulty = Phaser.Math.Clamp(elapsedSeconds / 40, 0, 1);
        const aggressiveRamp = Math.pow(difficulty, 1);
        const spawnX = this.frameX + this.frameWidth - 25;
        const spawnY = this.ground.y - this.ground.height / 2 - 10 + this.obstacleYOffset;
        const obstacle = this.add.image(spawnX, spawnY, "rock");
        this.physics.add.existing(obstacle);
        this.obstacles.add(obstacle);

        obstacle.body.setSize(obstacle.width, obstacle.height);
        const obstacleSpeed = Phaser.Math.Linear(280, 620, aggressiveRamp);
        obstacle.body.setVelocityX(-obstacleSpeed);
        // if (elapsed >= 33) {
        //     obstacle.body.setVelocityX(-500);
        // } else if (elapsed >= 28) {
        //     obstacle.body.setVelocityX(-430);
        // } else if (elapsed >= 20) {
        //     obstacle.body.setVelocityX(-395);
        // } else
        //     if (elapsed >= 13) {
        //         obstacle.body.setVelocityX(-315);
        //     } else {
        //         obstacle.body.setVelocityX(-300);
        //     }
        obstacle.body.setImmovable(true);
        obstacle.body.setAllowGravity(false);

    }

    autoJumpInspector() {
        if (!this.inspector || !this.inspector.body) {
            return;
        }

        const now = this.time.now;
        if (now - this.inspectorLastJumpTime < this.inspectorJumpCooldownMs) {
            return;
        }

        const isGrounded = this.inspector.body.touching.down || this.inspector.body.blocked.down;
        if (!isGrounded) {
            return;
        }

        let closestObstacle = null;
        let closestDistance = Number.POSITIVE_INFINITY;

        this.obstacles.children.iterate((obstacle) => {
            if (!obstacle || !obstacle.active || !obstacle.body) {
                return;
            }

            const distanceAhead = obstacle.x - this.inspector.x;
            if (distanceAhead > 0 && distanceAhead < closestDistance) {
                closestObstacle = obstacle;
                closestDistance = distanceAhead;
            }
        });

        if (!closestObstacle) {
            return;
        }

        const obstacleHalfWidth = (closestObstacle.displayWidth || closestObstacle.width || 0) / 2;
        const triggerDistance = this.inspectorJumpTriggerDistance + obstacleHalfWidth;

        if (closestDistance <= triggerDistance) {
            this.inspector.body.setVelocityY(this.inspectorJumpVelocity);
            this.inspectorLastJumpTime = now;
        }
    }



    endGame(message, textColor) {
        this.gameIsOver = true;
        this.physics.pause();
        this.farmer.destroy();
        this.inspector.destroy();
        this.obstacles.clear(true, true);
        centerText(this, message, -30, { fill: textColor, fontSize: "26px", align: "center" });


    }

    gameOver() {
        console.log("Caught by the seed inspector!");
            this.chaseMusic.stop();

        this.sound.play('youlost', { volume: .2 });
        this.endGame("you've been caught!\n\nYOU ARE UNDER ARREST", "#ed3833");

        createMenu(this, {
            title: [""],
            options: ["[ GO TO JAIL ]"],
            callbacks: [
                () => {
                    const backgroundMusic = this.sound.get('backgroundMusic');
                    if (backgroundMusic) {
                        backgroundMusic.resume();
                    }
                    this.game.globalState.money -= this.game.globalState.fines;
                    this.game.globalState.fines = 0;
                    this.game.globalState.failedInspectorChase = true;
                    this.scene.get('hud').updateStats();
                    this.scene.start("escape_jail");
                }
            ],
            startY: 240,
            gap: 36,
            fontColor: "#ffffff",
            highlightColor: "#1645f5"
        });
    }

    winGame() {
        console.log("You escaped!");
            this.chaseMusic.stop();

        this.sound.play('youwin', { volume: .2 });
        this.endGame("you've escaped!", "#33ff00");
        this.game.globalState.criminality += 1;
        this.getScene('hud').updateStats();
        createMenu(this, {
            title: [""],
            options: ["[ return to farm ]"],
            callbacks: [
                () => {
                    const backgroundMusic = this.sound.get('backgroundMusic');
                    if (backgroundMusic) {
                        backgroundMusic.resume();
                    }
                    this.scene.start("police_encounter");
                }
            ],
            startY: 240,
            gap: 36,
            fontColor: "#ffffff",
            highlightColor: "#1645f5"
        });
    }
}
