import { COLORS, OFFSETS, TYPEWRITER_SPEED, FONTSIZE } from "./constants.js";
import { isButtonPressed, GAMEPAD } from "./src/gamepad.js";

export function centerText(scene, msg, yOffset = -80, style = {}) {
    const { width, height } = scene.scale;

    return scene.add.text(
        width / 2,
        height / 2 + yOffset,
        msg,
        {
            fontSize: style.fontSize || FONTSIZE.MENU,
            fontFamily: style.fontFamily || 'PressStart2P',
            fill: style.fill || COLORS.PRIMARY_BLUE,
            align: style.align || 'justify',
            wordWrap: style.wordWrap || { width: width * .78, useAdvancedWrap: true},
            lineSpacing: style.lineSpacing || 10
        }
    ).setOrigin(0.5, 0);
}




export function createTypewriterText(scene, fullText, yOffset = 0, style = {}, speed = TYPEWRITER_SPEED.DEFAULT, onComplete) {
    const { width, height } = scene.scale;
    const textObject = scene.add.text(
        width * OFFSETS.TYPEWRITER_X_RATIO,
        height / 2 + yOffset,
        '',
        {
            fontSize: style.fontSize || FONTSIZE.MENU,
            fontFamily: style.fontFamily || 'PressStart2P',
            fill: style.fill || COLORS.PRIMARY_BLUE,
            align: style.align || 'left',
            wordWrap: style.wordWrap || { width: width * .78, useAdvancedWrap: true},
            lineSpacing: style.lineSpacing || 10
        }
    ).setOrigin(0, 0);
    
    // Apply typewriter animation
    let currentIndex = 0;
    
    scene.time.addEvent({
        delay: speed,
        callback: () => {
            if (currentIndex < fullText.length) {
                currentIndex++;
                textObject.setText(fullText.substring(0, currentIndex));
                if (currentIndex === fullText.length && typeof onComplete === 'function') {
                    onComplete();
                }
            }
        },
        repeat: fullText.length - 1
    });
    return textObject;

    
}

