import { centerText } from "../ui.js";
import { createMenu } from "../menu.js";
import { escapeReset } from "../escreset.js";
import { COLORS, OFFSETS } from "../constants.js";

export default class escape_jail extends Phaser.Scene {
    constructor() {
        super("escape_jail");
    }

    init(data) {
        this.nextScene = data?.nextScene || "title_scene";
    }

    preload() {
        this.load.atlas("farmer", "assets/farmer.png", "assets/farmer.json");
        this.load.atlas("inspector", "assets/inspector.png", "assets/inspector.json");
        this.load.audio('runjump_background', 'assets/sounds/runjump_background.wav');
        this.load.audio('youlost', 'assets/sounds/youlost.wav');
        this.load.audio('youwin', 'assets/sounds/youwin.wav');
    }

    create() {
        escapeReset(this);
        // this.cameras.main.setBackgroundColor("#0f1d3a");

        const backgroundMusic = this.sound.get('backgroundMusic');
        if (backgroundMusic) {
            backgroundMusic.pause();
        }
        this.chaseMusic = this.sound.add('runjump_background', { loop: true, volume: 0.5 });
        this.chaseMusic.play();
        this.events.once('shutdown', () => {
            this.chaseMusic.stop();
        });
        this.cameras.main.setBackgroundColor("#ed3833");

        // Create a filled rectangular frame centered on screen
        const frameGraphics = this.add.graphics();
        const centerX = this.scale.width / 2 - 400;
        const centerY = this.scale.height / 2 - 240;
        const frameWidth = 800;
        const frameHeight = 450;
        this.field = {
            x: centerX,
            y: centerY,
            width: frameWidth,
            height: frameHeight
        };
        frameGraphics.fillStyle(0x1645f5, 0.8); // fill color and alpha
        frameGraphics.fillRect(this.field.x, this.field.y, this.field.width, this.field.height);
        frameGraphics.lineStyle(4, 0xffffff, 1); // 4px white border
        frameGraphics.strokeRect(this.field.x, this.field.y, this.field.width, this.field.height);
        const borderInset = -10;
        this.physics.world.setBounds(
            this.field.x + borderInset,
            this.field.y + borderInset,
            this.field.width - borderInset * 2,
            this.field.height - borderInset * 2,
            true,
            true,
            true,
            true
        );
        this.playfieldTopBound = this.field.y + borderInset;


        this.roundOver = false;
        this.pelletsCollected = 0;
        this.pelletsNeeded = 8;
        this.policeSpeed = 250;
        this.policeSmoothedVX = 0;
        this.navCellSize = 26;
        this.navCols = 0;
        this.navRows = 0;
        this.navBlocked = [];
        this.policePath = [];
        this.policePathIndex = 0;
        this.policeReplanTimer = 0;
        this.policeReplanEveryMs = 180;
        this.lastPoliceStartCellKey = null;
        this.lastPoliceGoalCellKey = null;
        this.policeStuckCheckTimer = 220;
        this.policeStuckCheckEveryMs = 220;
        this.policeStuckMinMove = 10;
        this.policeStuckCount = 0;
        this.policeStuckLimit = 2;
        this.policeLastSamplePos = null;
        this.policeNudgeTimer = 0;
        this.policeNudgeVX = 0;
        this.policeNudgeVY = 0;

        this.drawPlayfield();
        this.createWalls();
        this.buildNavGrid();
        this.createActors();
        this.createPellets();
        this.createExit();
        this.createHud();

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys("W,S,A,D");
    }

    drawPlayfield() {
        centerText(this, "ESCAPE JAIL", -200, { fill: "#ffffff", fontSize: "30px" });
    }

    createWalls() {
        this.walls = this.physics.add.staticGroup();
        this.wallRects = [];

        const createWall = (x, y, w, h) => {
            const wall = this.add.rectangle(x, y, w, h, 0x222222);
            // wall.setStrokeStyle(2, 0xffffff);
            this.physics.add.existing(wall, true);
            this.walls.add(wall);
            this.wallRects.push({
                left: x - w / 2,
                right: x + w / 2,
                top: y - h / 2,
                bottom: y + h / 2
            });
        };

        const createHWall = (x1, x2, y, thickness = 18) => {
            createWall((x1 + x2) / 2, y, x2 - x1, thickness);
        };

        const createVWall = (x, y1, y2, thickness = 18) => {
            createWall(x, (y1 + y2) / 2, thickness, y2 - y1);
        };

        const left = this.field.x;
        const right = this.field.x + this.field.width;
        const top = this.field.y;
        const bottom = this.field.y + this.field.height;
        const width = this.field.width;
        const height = this.field.height;
        const midX = left + width / 2;
        const midY = top + height / 2;

        // Keep all maze walls inset from the frame edge so actors can pass around the border.
        const edgePadding = 90;
        const laneLeft = left + edgePadding;
        const laneRight = right - edgePadding;
        const laneTop = top + edgePadding;
        const laneBottom = bottom - edgePadding;

        // Outer inner ring
        createHWall(laneLeft, laneRight, laneTop);
        createHWall(laneLeft, midX - 50, laneBottom);
        createHWall(midX + 50, laneRight, laneBottom);
        createVWall(laneLeft, laneTop, midY - 54);

        createVWall(midX + 50, midY + 34, laneBottom);
        createVWall(laneRight, midY + 34, laneBottom);

        // Main cross with openings at the sides
        // createHWall(laneLeft + 92, laneRight - 92, midY);
        // createVWall(midX, laneTop + 24, laneBottom - 24);

        // Extra branches for more maze-like routing
        createHWall(midX + 62, laneRight, laneTop + 100);
        createHWall(laneLeft, midX - 62, laneBottom - 100);
        // createVWall(midX - 150, laneTop + 120, midY - 38);
        // createVWall(midX + 150, midY + 38, laneBottom - 120);
    }

    createActors() {
        this.farmer = this.physics.add.sprite(this.field.x + 60, this.field.y + 60, "farmer", "farmer 0.png");
        this.farmer.setScale(0.7);
        this.farmer.body.setSize(36, 70);
        this.farmer.body.setOffset(22, 40);
        this.farmer.setCollideWorldBounds(true);

        this.police = this.physics.add.sprite(this.field.x + this.field.width - 80, this.field.y + this.field.height - 70, "inspector", "inspector 0.png");
        this.police.setScale(0.7);
        this.police.body.setSize(30, 55);
        this.police.body.setOffset(22, 60);
        this.police.setCollideWorldBounds(true);

        if (!this.anims.exists("escapeFarmerWalk")) {
            this.anims.create({
                key: "escapeFarmerWalk",
                frames: this.anims.generateFrameNames("farmer", {
                    prefix: "farmer ",
                    suffix: ".png",
                    start: 0,
                    end: 3
                }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.anims.exists("escapePoliceWalk")) {
            this.anims.create({
                key: "escapePoliceWalk",
                frames: this.anims.generateFrameNames("inspector", {
                    prefix: "inspector ",
                    suffix: ".png",
                    start: 0,
                    end: 3
                }),
                frameRate: 10,
                repeat: -1
            });
        }

        this.farmer.play("escapeFarmerWalk");
        this.police.play("escapePoliceWalk");

        this.physics.add.collider(this.farmer, this.walls);
        this.physics.add.collider(this.police, this.walls);
        this.physics.add.overlap(this.farmer, this.police, () => this.endRound(false), null, this);
        this.policeLastSamplePos = { x: this.police.x, y: this.police.y };
    }

    buildNavGrid() {
        this.navCols = Math.max(1, Math.floor(this.field.width / this.navCellSize));
        this.navRows = Math.max(1, Math.floor(this.field.height / this.navCellSize));
        this.navBlocked = Array.from({ length: this.navRows }, () => Array(this.navCols).fill(false));

        const policeRadius = 16;
        const inflate = policeRadius + 2;
        for (let row = 0; row < this.navRows; row += 1) {
            for (let col = 0; col < this.navCols; col += 1) {
                const world = this.cellToWorld(col, row);
                for (const wall of this.wallRects) {
                    if (
                        world.x >= wall.left - inflate
                        && world.x <= wall.right + inflate
                        && world.y >= wall.top - inflate
                        && world.y <= wall.bottom + inflate
                    ) {
                        this.navBlocked[row][col] = true;
                        break;
                    }
                }
            }
        }
    }

    worldToCell(x, y) {
        const localX = x - this.field.x;
        const localY = y - this.field.y;
        const col = Phaser.Math.Clamp(Math.floor(localX / this.navCellSize), 0, this.navCols - 1);
        const row = Phaser.Math.Clamp(Math.floor(localY / this.navCellSize), 0, this.navRows - 1);
        return { col, row };
    }

    cellToWorld(col, row) {
        return {
            x: this.field.x + col * this.navCellSize + this.navCellSize / 2,
            y: this.field.y + row * this.navCellSize + this.navCellSize / 2
        };
    }

    isWalkable(col, row) {
        if (col < 0 || row < 0 || col >= this.navCols || row >= this.navRows) return false;
        return !this.navBlocked[row][col];
    }

    nearestWalkableCell(startCol, startRow, maxRadius = 4) {
        if (this.isWalkable(startCol, startRow)) return { col: startCol, row: startRow };

        for (let radius = 1; radius <= maxRadius; radius += 1) {
            const minCol = Math.max(0, startCol - radius);
            const maxCol = Math.min(this.navCols - 1, startCol + radius);
            const minRow = Math.max(0, startRow - radius);
            const maxRow = Math.min(this.navRows - 1, startRow + radius);

            for (let row = minRow; row <= maxRow; row += 1) {
                for (let col = minCol; col <= maxCol; col += 1) {
                    const onRing = row === minRow || row === maxRow || col === minCol || col === maxCol;
                    if (onRing && this.isWalkable(col, row)) return { col, row };
                }
            }
        }
        return null;
    }

    reconstructPath(cameFrom, endKey) {
        const out = [];
        let cursor = endKey;
        while (cursor) {
            const [colStr, rowStr] = cursor.split(":");
            out.push({ col: Number(colStr), row: Number(rowStr) });
            cursor = cameFrom.get(cursor) || null;
        }
        out.reverse();
        return out;
    }

    findPathAStar(startCol, startRow, goalCol, goalRow) {
        const startKey = `${startCol}:${startRow}`;
        const goalKey = `${goalCol}:${goalRow}`;

        if (startKey === goalKey) return [{ col: startCol, row: startRow }];
        if (!this.isWalkable(startCol, startRow) || !this.isWalkable(goalCol, goalRow)) return [];

        const open = [{ col: startCol, row: startRow }];
        const openSet = new Set([startKey]);
        const cameFrom = new Map();
        const gScore = new Map([[startKey, 0]]);
        const fScore = new Map([[startKey, Math.abs(goalCol - startCol) + Math.abs(goalRow - startRow)]]);

        const neighbors = [
            { dc: 1, dr: 0 },
            { dc: -1, dr: 0 },
            { dc: 0, dr: 1 },
            { dc: 0, dr: -1 }
        ];

        while (open.length > 0) {
            let bestIndex = 0;
            let bestKey = `${open[0].col}:${open[0].row}`;
            let bestF = fScore.get(bestKey) ?? Number.POSITIVE_INFINITY;
            for (let i = 1; i < open.length; i += 1) {
                const key = `${open[i].col}:${open[i].row}`;
                const f = fScore.get(key) ?? Number.POSITIVE_INFINITY;
                if (f < bestF) {
                    bestF = f;
                    bestIndex = i;
                    bestKey = key;
                }
            }

            const current = open.splice(bestIndex, 1)[0];
            openSet.delete(bestKey);
            if (bestKey === goalKey) return this.reconstructPath(cameFrom, goalKey);

            const currentG = gScore.get(bestKey) ?? Number.POSITIVE_INFINITY;
            for (const n of neighbors) {
                const nextCol = current.col + n.dc;
                const nextRow = current.row + n.dr;
                if (!this.isWalkable(nextCol, nextRow)) continue;

                const nextKey = `${nextCol}:${nextRow}`;
                const tentativeG = currentG + 1;
                if (tentativeG >= (gScore.get(nextKey) ?? Number.POSITIVE_INFINITY)) continue;

                cameFrom.set(nextKey, bestKey);
                gScore.set(nextKey, tentativeG);
                const h = Math.abs(goalCol - nextCol) + Math.abs(goalRow - nextRow);
                fScore.set(nextKey, tentativeG + h);
                if (!openSet.has(nextKey)) {
                    open.push({ col: nextCol, row: nextRow });
                    openSet.add(nextKey);
                }
            }
        }

        return [];
    }

    replanPolicePath() {
        const policeCellRaw = this.worldToCell(this.police.x, this.police.y);
        const farmerCellRaw = this.worldToCell(this.farmer.x, this.farmer.y);

        const policeCell = this.nearestWalkableCell(policeCellRaw.col, policeCellRaw.row) || policeCellRaw;
        const farmerCell = this.nearestWalkableCell(farmerCellRaw.col, farmerCellRaw.row) || farmerCellRaw;

        const startKey = `${policeCell.col}:${policeCell.row}`;
        const goalKey = `${farmerCell.col}:${farmerCell.row}`;
        const sameEndpoints = this.lastPoliceStartCellKey === startKey && this.lastPoliceGoalCellKey === goalKey;
        if (sameEndpoints && this.policePath.length > 0 && this.policePathIndex < this.policePath.length) return;

        this.lastPoliceStartCellKey = startKey;
        this.lastPoliceGoalCellKey = goalKey;

        const pathCells = this.findPathAStar(policeCell.col, policeCell.row, farmerCell.col, farmerCell.row);
        if (pathCells.length === 0) {
            this.policePath = [];
            this.policePathIndex = 0;
            return;
        }

        this.policePath = pathCells.map((cell) => this.cellToWorld(cell.col, cell.row));
        this.policePathIndex = this.policePath.length > 1 ? 1 : 0;
    }

    getPoliceRepulsionDirection() {
        let pushX = 0;
        let pushY = 0;
        const influenceRadius = 70;

        for (const wall of this.wallRects) {
            const closestX = Phaser.Math.Clamp(this.police.x, wall.left, wall.right);
            const closestY = Phaser.Math.Clamp(this.police.y, wall.top, wall.bottom);
            const awayX = this.police.x - closestX;
            const awayY = this.police.y - closestY;
            const d = Math.hypot(awayX, awayY);
            if (d > influenceRadius) continue;

            const safeDist = Math.max(0.001, d);
            const weight = (influenceRadius - safeDist) / influenceRadius;
            pushX += (awayX / safeDist) * weight;
            pushY += (awayY / safeDist) * weight;
        }

        const len = Math.hypot(pushX, pushY);
        if (len > 0.001) {
            return { x: pushX / len, y: pushY / len };
        }

        if (this.policePath.length > 0 && this.policePathIndex < this.policePath.length) {
            const target = this.policePath[this.policePathIndex];
            const dx = target.x - this.police.x;
            const dy = target.y - this.police.y;
            const d = Math.hypot(dx, dy) || 1;
            return { x: dx / d, y: dy / d };
        }

        return { x: 1, y: 0 };
    }

    triggerPoliceUnstick() {
        const dir = this.getPoliceRepulsionDirection();

        this.policeNudgeTimer = 150;
        this.policeNudgeVX = dir.x * (this.policeSpeed * 0.9);
        this.policeNudgeVY = dir.y * (this.policeSpeed * 0.9);

        // Force a fresh route from the new position after nudge resolves.
        this.lastPoliceStartCellKey = null;
        this.policeReplanTimer = 0;
        this.policePath = [];
        this.policePathIndex = 0;
    }

    updatePoliceStuckState(delta, intendedVX, intendedVY) {
        if (!this.policeLastSamplePos) {
            this.policeLastSamplePos = { x: this.police.x, y: this.police.y };
        }

        this.policeStuckCheckTimer -= delta;
        if (this.policeStuckCheckTimer > 0) return;
        this.policeStuckCheckTimer = this.policeStuckCheckEveryMs;

        const moved = Math.hypot(
            this.police.x - this.policeLastSamplePos.x,
            this.police.y - this.policeLastSamplePos.y
        );
        this.policeLastSamplePos = { x: this.police.x, y: this.police.y };

        const wantsToMove = Math.hypot(intendedVX, intendedVY) > 20;
        const blocked = this.police.body.blocked.left || this.police.body.blocked.right || this.police.body.blocked.up || this.police.body.blocked.down;
        if (wantsToMove && blocked && moved < this.policeStuckMinMove) {
            this.policeStuckCount += 1;
        } else {
            this.policeStuckCount = 0;
        }

        if (this.policeStuckCount >= this.policeStuckLimit) {
            this.policeStuckCount = 0;
            this.triggerPoliceUnstick();
        }
    }

    updatePoliceChase(delta) {
        if (this.policeNudgeTimer > 0) {
            this.policeNudgeTimer -= delta;
            this.police.body.setVelocity(this.policeNudgeVX, this.policeNudgeVY);
            return;
        }

        this.policeReplanTimer -= delta;
        if (this.policeReplanTimer <= 0) {
            this.policeReplanTimer = this.policeReplanEveryMs;
            this.replanPolicePath();
        }

        if (this.policePath.length > 0 && this.policePathIndex < this.policePath.length) {
            let waypoint = this.policePath[this.policePathIndex];
            let dx = waypoint.x - this.police.x;
            let dy = waypoint.y - this.police.y;
            let dist = Math.hypot(dx, dy);

            const arrivalRadius = 10;
            while (dist < arrivalRadius && this.policePathIndex < this.policePath.length - 1) {
                this.policePathIndex += 1;
                waypoint = this.policePath[this.policePathIndex];
                dx = waypoint.x - this.police.x;
                dy = waypoint.y - this.police.y;
                dist = Math.hypot(dx, dy);
            }

            if (dist > 0.0001) {
                const vx = (dx / dist) * this.policeSpeed;
                const vy = (dy / dist) * this.policeSpeed;
                this.police.body.setVelocity(vx, vy);
                this.updatePoliceStuckState(delta, vx, vy);
                return;
            }
        }

        // Fallback if no path is available.
        const toFarmerX = this.farmer.x - this.police.x;
        const toFarmerY = this.farmer.y - this.police.y;
        const distance = Math.hypot(toFarmerX, toFarmerY) || 1;
        const fallbackVX = (toFarmerX / distance) * this.policeSpeed;
        const fallbackVY = (toFarmerY / distance) * this.policeSpeed;
        this.police.body.setVelocity(fallbackVX, fallbackVY);
        this.updatePoliceStuckState(delta, fallbackVX, fallbackVY);
    }

    createPellets() {
        this.pellets = this.physics.add.staticGroup();

        const spots = [
            [this.field.x + 200, this.field.y + 40],
            [this.field.x + this.field.width / 2, this.field.y + 170],
            [this.field.x + this.field.width - 40, this.field.y + 70],
            [this.field.x + 120, this.field.y + this.field.y],
            [this.field.x + this.field.width - 170, this.field.y + this.field.height / 2],
            [this.field.x + 220, this.field.y + this.field.height - 110],
            [this.field.x + this.field.width / 2, this.field.y + this.field.height - 30],
            [this.field.x + this.field.width - 280, this.field.y + this.field.height - 110]
        ];

        spots.forEach(([x, y]) => {
            const pellet = this.add.circle(x, y, 8, 0xffe066);
            this.physics.add.existing(pellet, true);
            this.pellets.add(pellet);
        });

        this.physics.add.overlap(this.farmer, this.pellets, this.collectPellet, null, this);
    }

    createExit() {
        this.exitDoor = this.add.rectangle(
            this.field.x + this.field.width - 24,
            this.field.y + this.field.height / 2,
            18,
            120,
            0xb5444f
        );
        this.exitDoorText = this.add.text(this.exitDoor.x - 58, this.exitDoor.y - 8, "LOCKED", {
            fontFamily: "PressStart2P",
            fontSize: "12px",
            fill: "#ffffff"
        });
        this.physics.add.existing(this.exitDoor, true);

        this.physics.add.overlap(this.farmer, this.exitDoor, () => {
            if (this.pelletsCollected >= this.pelletsNeeded) {
                this.endRound(true);
            }
        });
    }

    createHud() {
        this.hudText = this.add.text(this.field.width, this.field.y + this.field.height - 20, "", {
            fontFamily: "PressStart2P",
            fontSize: "12px",
            fill: "#ffffff"
        });
        this.hintText = this.add.text(this.field.x + 30, this.field.y + this.field.height - 20, "collect all dots, then reach the gate", {
            fontFamily: "PressStart2P",
            fontSize: "11px",
            fill: "#ffffff"
        });
        this.refreshHud();
    }

    collectPellet(farmer, pellet) {
        pellet.destroy();
        this.pelletsCollected += 1;

        if (this.pelletsCollected >= this.pelletsNeeded) {
            this.exitDoor.setFillStyle(0x33aa55);
            this.exitDoorText.setText("OPEN");
        }
        this.refreshHud();
    }

    refreshHud() {
        this.hudText.setText(`dots: ${this.pelletsCollected}/${this.pelletsNeeded}`);
    }

    clampActorToTop(actor) {
        const minY = this.playfieldTopBound + actor.displayHeight * actor.originY;
        if (actor.y >= minY) return;

        actor.y = minY;
        if (actor.body.velocity.y < 0) {
            actor.body.setVelocityY(0);
        }
    }

    update(time, delta) {
        if (this.roundOver || !this.farmer?.body || !this.police?.body) return;

        const moveSpeed = 230;
        let vx = 0;
        let vy = 0;

        if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= moveSpeed;
        if (this.cursors.right.isDown || this.wasd.D.isDown) vx += moveSpeed;
        if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= moveSpeed;
        if (this.cursors.down.isDown || this.wasd.S.isDown) vy += moveSpeed;

        this.farmer.body.setVelocity(vx, vy);
        this.farmer.body.velocity.normalize().scale(moveSpeed);
        if (this.farmer.body.velocity.x < -5) {
            this.farmer.setFlipX(true);
        } else if (this.farmer.body.velocity.x > 5) {
            this.farmer.setFlipX(false);
        }

        this.updatePoliceChase(delta);
        this.clampActorToTop(this.farmer);
        this.clampActorToTop(this.police);

        // Smooth the X velocity over ~5 frames before flipping to prevent rapid oscillation.
        this.policeSmoothedVX = this.policeSmoothedVX * 0.8 + this.police.body.velocity.x * 0.2;
        if (this.policeSmoothedVX < -30) this.police.setFlipX(true);
        else if (this.policeSmoothedVX > 30) this.police.setFlipX(false);
    }

    endRound(playerWon) {
        if (this.roundOver) return;
        this.roundOver = true;
            this.chaseMusic.stop();
        this.farmer.body.setVelocity(0, 0);
        this.police.body.setVelocity(0, 0);

        this.physics.pause();


        const resultTitle = playerWon ? "YOU ESCAPED" : "CAUGHT BY POLICE";
        const resultColor = playerWon ? "#33ff66" : "#ff4d4d";
        centerText(this, resultTitle, -16, { fill: resultColor, fontSize: "24px" });

        if (playerWon) {
            this.sound.play('youwin');
            this.game.globalState.escapedJail = true;
        } else {
            this.sound.play('youlost');
            this.game.globalState.escapedJail = false;
        }
        this.scene.get("hud").updateStats();

        createMenu(this, {
            title: "",
            options: [
                "[ CONTINUE ]",
            ],
            callbacks: [
                () => this.scene.start("demo_ending")
            ],
            startY: 240,
            gap: 36,
            fontColor: "#ffffff",
            highlightColor: COLORS.PRIMARY_BLUE
        });
    }
}
