// menu.js
// this is for keyboard toggles/input
import { centerText } from "./ui.js";
import { COLORS, FONTSIZE } from "./constants.js";

export function createMenu(scene, {

    title,
    options,       // [ "Option text", ... ]
    callbacks,     // [ ()=>{}, ()=>{}, ... ]
    startY = 200,
    fontSize = FONTSIZE.MENU,
    gap = 30,
    startX = 50,
    fontColor = COLORS.WHITE,
    highlightColor = COLORS.PRIMARY_BLUE

}) {

    // --- Draw Title ---
    const { width, height } = scene.scale;

    centerText(scene, title, 160, { fill: highlightColor, fontSize: "20px" });

    // --- Build menu option texts ---
    const optionObjects = options.map((text, i) => {
        const textObj = scene.add.text(0, 0, text, {
            fontFamily: 'PressStart2P',
            fontSize: fontSize,
            fill: fontColor,
            align: 'justify',
            // wordWrap: { width: width * .8, useAdvancedWrap: true }
        });
        const centerY = scene.scale.height / 2 + (startY + i * gap) + 25;
        textObj.setPosition(startX + 150, centerY);
        textObj.setOrigin(0, 0.5); // left-align horizontally, center vertically
        return textObj;
    });

    let index = 0;

    const updateHighlight = () => {
        optionObjects.forEach((opt, i) => {
            opt.setStyle({ fill: i === index ? highlightColor : fontColor });
            opt.setScale(i === index ? 1.1 : 1);
        });
    };
    updateHighlight();

    // --- Input events for menu navigation and selection ---
    const K = Phaser.Input.Keyboard.KeyCodes;
    // Store references to listeners so we can remove them later if needed
    const listeners = [];

    listeners.push(
        scene.input.keyboard.on('keydown-UP', () => {
            index = (index - 1 + options.length) % options.length;
            updateHighlight();
            try {
                if (scene.sound && typeof scene.sound.play === 'function' &&
                    scene.cache && scene.cache.audio && typeof scene.cache.audio.exists === 'function' &&
                    scene.cache.audio.exists('menuMove')) {
                    scene.sound.play('menuMove');
                } else if (window && window.__globalMoveAudio) {
                    try { window.__globalMoveAudio.currentTime = 0; window.__globalMoveAudio.play().catch(() => { }); } catch (e) { }
                }
            } catch (e) { console.warn('Failed to play move sound', e); }
        }, scene)
    );
    listeners.push(
        scene.input.keyboard.on('keydown-W', () => {
            index = (index - 1 + options.length) % options.length;
            updateHighlight();
            try {
                if (scene.sound && typeof scene.sound.play === 'function' &&
                    scene.cache && scene.cache.audio && typeof scene.cache.audio.exists === 'function' &&
                    scene.cache.audio.exists('menuMove')) {
                    scene.sound.play('menuMove');
                } else if (window && window.__globalMoveAudio) {
                    try { window.__globalMoveAudio.currentTime = 0; window.__globalMoveAudio.play().catch(() => { }); } catch (e) { }
                }
            } catch (e) { console.warn('Failed to play move sound', e); }
        }, scene)
    );
    listeners.push(
        scene.input.keyboard.on('keydown-DOWN', () => {
            index = (index + 1) % options.length;
            updateHighlight();
            try {
                if (scene.sound && typeof scene.sound.play === 'function' &&
                    scene.cache && scene.cache.audio && typeof scene.cache.audio.exists === 'function' &&
                    scene.cache.audio.exists('menuMove')) {
                    scene.sound.play('menuMove');
                } else if (window && window.__globalMoveAudio) {
                    try { window.__globalMoveAudio.currentTime = 0; window.__globalMoveAudio.play().catch(() => { }); } catch (e) { }
                }
            } catch (e) { console.warn('Failed to play move sound', e); }
        }, scene)
    );
    listeners.push(
        scene.input.keyboard.on('keydown-S', () => {
            index = (index + 1) % options.length;
            updateHighlight();
            try {
                if (scene.sound && typeof scene.sound.play === 'function' &&
                    scene.cache && scene.cache.audio && typeof scene.cache.audio.exists === 'function' &&
                    scene.cache.audio.exists('menuMove')) {
                    scene.sound.play('menuMove');
                } else if (window && window.__globalMoveAudio) {
                    try { window.__globalMoveAudio.currentTime = 0; window.__globalMoveAudio.play().catch(() => { }); } catch (e) { }
                }
            } catch (e) { console.warn('Failed to play move sound', e); }
        }, scene)
    );
    // Selection (space or enter)
    const selectHandler = () => {
        try {
            if (scene.sound && typeof scene.sound.play === 'function' &&
                scene.cache && scene.cache.audio && typeof scene.cache.audio.exists === 'function' &&
                scene.cache.audio.exists('menuSelect')) {
                scene.sound.play('menuSelect');
            } else if (window && window.__globalSelectAudio) {
                try { window.__globalSelectAudio.currentTime = 0; window.__globalSelectAudio.play().catch(() => { }); } catch (e) { }
            }
        } catch (e) { console.warn('Failed to play select sound', e); }
        const cb = callbacks[index];
        if (typeof cb === 'function') {
            try { cb(); } catch (e) { console.error('Menu callback threw', e); }
        } else {
            console.warn('Menu callback is not a function at index', index);
        }
    };
    listeners.push(scene.input.keyboard.on('keydown-SPACE', selectHandler, scene));
    listeners.push(scene.input.keyboard.on('keydown-ENTER', selectHandler, scene));

    // Optionally return a cleanup function to remove listeners if needed
    return () => {
        listeners.forEach(listener => listener.remove && listener.remove());
    };

    // --- Optional mouse click support ---
    // optionObjects.forEach((opt, i) => {
    //     opt.setInteractive();
    //     opt.on("pointerdown", () => callbacks[i]());
    // });
}
