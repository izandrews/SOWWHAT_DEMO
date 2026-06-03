export const GAMEPAD = {
    RESET_BUTTON: 0,      // B0
    SELECT_BUTTON: 11,    // B11

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

    const rawX = pad.axes[0]?.getValue() || 0;
    const rawY = pad.axes[1]?.getValue() || 0;

    /*
        Physical joystick is rotated/mounted wrong:

        Physical UP    reads as RIGHT  => rawX positive
        Physical LEFT  reads as UP     => rawY negative
        Physical RIGHT reads as DOWN   => rawY positive
        Physical DOWN  reads as LEFT   => rawX negative
in 
        Desired logical mapping:
        logical UP    = physical UP
        logical DOWN  = physical DOWN
        logical LEFT  = physical LEFT
        logical RIGHT = physical RIGHT
    */

    const correctedX = rawY;
    const correctedY = -rawX;

    return {
        x: Math.abs(correctedX) > GAMEPAD.DEADZONE ? correctedX : 0,
        y: Math.abs(correctedY) > GAMEPAD.DEADZONE ? correctedY : 0
    };
}