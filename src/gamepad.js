// src/gamepad.js

export const GAMEPAD = {
    RESET_BUTTON: 0,
    SELECT_BUTTON: 1,
    DEADZONE: 0.45,
    MENU_REPEAT_DELAY: 180
};

export function getPad(scene) {
    return scene.input.gamepad?.getPad(0) || null;
}

export function isButtonPressed(scene, buttonIndex) {
    const pad = getPad(scene);
    return !!pad?.buttons?.[buttonIndex]?.pressed;
}

export function getStick(scene) {
    const pad = getPad(scene);
    if (!pad) return { x: 0, y: 0 };

    const x = pad.axes[0]?.getValue() || 0;
    const y = pad.axes[1]?.getValue() || 0;

    return {
        x: Math.abs(x) > GAMEPAD.DEADZONE ? x : 0,
        y: Math.abs(y) > GAMEPAD.DEADZONE ? y : 0
    };
}