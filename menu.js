// menu.js
import { centerText } from "./ui.js";
import { COLORS, FONTSIZE } from "./constants.js";
import { getStick, isButtonPressed, GAMEPAD } from "./src/gamepad.js";

export function createMenu(scene, {
    title,
    options,
    callbacks,
    startY = 200,
    fontSize = FONTSIZE.MENU,
    gap = 30,
    startX = 50,
    fontColor = COLORS.WHITE,
    highlightColor = COLORS.PRIMARY_BLUE
}) {
    centerText(scene, title, 160, {
        fill: highlightColor,
        fontSize: "20px"
    });

    const optionObjects = options.map((text, i) => {
        const textObj = scene.add.text(0, 0, text, {
            fontFamily: "PressStart2P",
            fontSize,
            fill: fontColor,
            align: "justify"
        });

        const centerY = scene.scale.height / 2 + (startY + i * gap) + 25;

        textObj.setPosition(startX + 150, centerY);
        textObj.setOrigin(0, 0.5);

        return textObj;
    });

    let index = 0;
    let lastMoveTime = 0;
    let selectWasDown = false;

    const playMoveSound = () => {
        try {
            if (
                scene.sound &&
                typeof scene.sound.play === "function" &&
                scene.cache?.audio?.exists?.("menuMove")
            ) {
                scene.sound.play("menuMove");
            } else if (window.__globalMoveAudio) {
                window.__globalMoveAudio.currentTime = 0;
                window.__globalMoveAudio.play().catch(() => {});
            }
        } catch (e) {
            console.warn("Failed to play move sound", e);
        }
    };

    const playSelectSound = () => {
        try {
            if (
                scene.sound &&
                typeof scene.sound.play === "function" &&
                scene.cache?.audio?.exists?.("menuSelect")
            ) {
                scene.sound.play("menuSelect");
            } else if (window.__globalSelectAudio) {
                window.__globalSelectAudio.currentTime = 0;
                window.__globalSelectAudio.play().catch(() => {});
            }
        } catch (e) {
            console.warn("Failed to play select sound", e);
        }
    };

    const updateHighlight = () => {
        optionObjects.forEach((opt, i) => {
            opt.setStyle({
                fill: i === index ? highlightColor : fontColor
            });
            opt.setScale(i === index ? 1.1 : 1);
        });
    };

    const moveUp = () => {
        index = (index - 1 + options.length) % options.length;
        updateHighlight();
        playMoveSound();
    };

    const moveDown = () => {
        index = (index + 1) % options.length;
        updateHighlight();
        playMoveSound();
    };

    const selectHandler = () => {
        playSelectSound();

        const cb = callbacks[index];

        if (typeof cb === "function") {
            try {
                cb();
            } catch (e) {
                console.error("Menu callback threw", e);
            }
        } else {
            console.warn("Menu callback is not a function at index", index);
        }
    };

    const upHandler = () => moveUp();
    const downHandler = () => moveDown();

    const gamepadUpdate = () => {
        if (!scene.input.gamepad) return;

        const now = scene.time.now;
        const stick = getStick(scene);

        if (now - lastMoveTime > GAMEPAD.MENU_REPEAT_DELAY) {
            if (stick.y < 0) {
                moveUp();
                lastMoveTime = now;
            } else if (stick.y > 0) {
                moveDown();
                lastMoveTime = now;
            }
        }

        const selectDown = isButtonPressed(scene, GAMEPAD.SELECT_BUTTON);

        if (selectDown && !selectWasDown) {
            selectHandler();
        }

        selectWasDown = selectDown;
    };

    updateHighlight();

    scene.input.keyboard.on("keydown-UP", upHandler);
    scene.input.keyboard.on("keydown-W", upHandler);
    scene.input.keyboard.on("keydown-DOWN", downHandler);
    scene.input.keyboard.on("keydown-S", downHandler);
    scene.input.keyboard.on("keydown-SPACE", selectHandler);
    scene.input.keyboard.on("keydown-ENTER", selectHandler);

    scene.events.on("update", gamepadUpdate);

    return () => {
        scene.input.keyboard.off("keydown-UP", upHandler);
        scene.input.keyboard.off("keydown-W", upHandler);
        scene.input.keyboard.off("keydown-DOWN", downHandler);
        scene.input.keyboard.off("keydown-S", downHandler);
        scene.input.keyboard.off("keydown-SPACE", selectHandler);
        scene.input.keyboard.off("keydown-ENTER", selectHandler);

        scene.events.off("update", gamepadUpdate);
    };
}