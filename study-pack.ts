//% color="#AA278D" icon="\uf303" block="Studyパック"
namespace studyPack {
    class CustomDialog extends game.Dialog {
        isFirst: boolean;
        prevCursor: Image;

        constructor(width: number, height: number, frame?: Image, font?: image.Font, cursor?: Image, prevCursor?: Image) {
            super(width, height, frame, font, cursor);
            this.prevCursor = prevCursor;
            this.isFirst = true;
        }

        drawCursorRow() {
            let offset = 0;
            if (this.cursorCount > 20) {
                offset = 1;
            }

            this.cursorCount = (this.cursorCount + 1) % 40;

            const aButton: Image = this.cursor ? this.cursor : img`
                0 0 0 6 6 6 6 6 0 0 0
                0 6 6 7 7 7 7 7 6 6 0
                0 6 7 7 1 1 1 7 7 6 0
                6 7 7 1 7 7 7 1 7 7 6
                6 7 7 1 7 7 7 1 7 7 6
                6 7 7 1 1 1 1 1 7 7 6
                6 6 7 1 7 7 7 1 7 6 6
                8 6 6 1 7 7 7 1 6 6 8
                8 6 6 7 6 6 6 7 6 6 8
                0 8 6 6 6 6 6 6 6 8 0
                0 0 8 8 8 8 8 8 8 0 0
                `;

            const bButton: Image = this.prevCursor ? this.prevCursor : img`
                . . . 6 6 6 6 6 . . . 
                . 6 6 7 7 7 7 7 6 6 . 
                . 6 7 1 1 1 1 7 7 6 . 
                6 7 7 1 7 7 1 7 7 7 6 
                6 7 7 1 1 1 1 1 7 7 6 
                6 7 7 1 7 7 7 1 7 7 6 
                6 6 7 1 7 7 7 1 7 6 6 
                8 6 6 1 1 1 1 1 6 6 8 
                8 6 6 7 7 7 7 7 6 6 8 
                . 8 6 6 6 6 6 6 6 8 . 
                . . 8 8 8 8 8 8 8 . . 
                `;

            !this.isFirst && this.image.drawTransparentImage(
                bButton,
                this.innerLeft + this.textAreaWidth() + this.unit + offset - this.cursor.width - (bButton.width + 4),
                this.innerTop + this.unit + this.textAreaHeight() + 1 - this.cursorRowHeight()
            )
            this.image.drawTransparentImage(
                aButton,
                this.innerLeft + this.textAreaWidth() + this.unit + offset - this.cursor.width,
                this.innerTop + this.unit + this.textAreaHeight() + 1 - this.cursorRowHeight()
            )
        }
    }

    /**
     * Show a long text strings in a dialog box that will scroll
     * using the "A" or "down" buttons. The previous section of the
     * text is shown using the "B" or "up" button. This function
     * halts execution until the last page of text is dismissed.
     *
     * @param array The text array to display
     * @param layout The layout to use for the dialog box
     */
    //% blockId=study_pack_show_texts group="StudyPacks"
    //% block="show long texts %array %layout||with prev cursor %prevCursor=screen_image_picker and next cursor %nextCursor=screen_image_picker"
    //% array.shadow="lists_create_with"
    //% array.defl="text"
    //% expandableArgumentMode="toggle"
    export function showTexts<T>(array: T[], layout: DialogLayout, prevCursor?: Image, nextCursor?: Image) {
        //const strs = array.map((e) => console.inspect(e));
        controller._setUserEventsEnabled(false);
        game.pushScene();
        game.currentScene().flags |= scene.Flag.SeeThrough;

        let width: number;
        let height: number;
        let top: number;
        let left: number;

        switch (layout) {
            case DialogLayout.Bottom:
                width = screen.width - 4;
                height = Math.idiv(screen.height, 3) + 5;
                top = screen.height - height;
                left = screen.width - width >> 1;
                break;
            case DialogLayout.Top:
                width = screen.width - 4;
                height = Math.idiv(screen.height, 3) + 5;
                top = 0;
                left = screen.width - width >> 1;
                break;
            case DialogLayout.Left:
                width = Math.idiv(screen.width, 3) + 5;
                height = screen.height;
                top = 0;
                left = 0;
                break;
            case DialogLayout.Right:
                width = Math.idiv(screen.width, 3) + 5;
                height = screen.height;
                top = 0;
                left = screen.width - width;
                break;
            case DialogLayout.Center:
                width = Math.idiv(screen.width << 1, 3);
                height = Math.idiv(screen.width << 1, 3);
                top = (screen.height - height) >> 1;
                left = (screen.width - width) >> 1;
                break;
            case DialogLayout.Full:
                width = screen.width;
                height = screen.height;
                top = 0;
                left = 0;
                break;
        }

        const dialog = new CustomDialog(width, height, null, null, nextCursor, prevCursor);
        const s = sprites.create(dialog.image, -1);
        s.top = top;
        s.left = left;
        s.z = 10;
        let sceneSprite: Sprite | null = null;

        const fetchStringElement = (dialog: CustomDialog, strs: T[], index: number, diff: number, min: number=0) => {
            index += diff;
            let str = strs[index];
            while (str !== undefined && typeof str !== 'string') {
                const image = (str as Object) as Image;
                index += diff;
                str = strs[index];
                if (sceneSprite) sceneSprite.destroy();
                sceneSprite = sprites.create(image, -1);
                sceneSprite.top = 0;
                sceneSprite.left = 0;
                sceneSprite.z = 1;
            }
            if (diff < 0) {
                let i = index + diff;
                let elm = strs[i];
                while (i > 0 && typeof elm !== 'object') {
                    i += diff;
                    elm = strs[i];
                }
                if (elm) {
                    if (sceneSprite) sceneSprite.destroy();
                    const image = (elm as Object) as Image;
                    sceneSprite = sprites.create(image, -1);
                    sceneSprite.top = 0;
                    sceneSprite.left = 0;
                    sceneSprite.z = 1;
                }
            }
            return {str: str, index: Math.max(index, min)};
        };

        let fetchedData = fetchStringElement(dialog, array, -1, 1);
        fetchedData.str !== undefined && dialog.setText('' + fetchedData.str);
        const minStrIndex = fetchedData.index;
        let pressed = true;
        let done = false;

        let upPressed = true;

        game.onUpdate(() => {
            dialog.update();
            const currentState = controller.A.isPressed() || controller.down.isPressed();
            if (currentState && !pressed) {
                pressed = true;
                if (dialog.hasNext()) {
                    dialog.nextPage();
                    dialog.isFirst = false;
                } else {
                    fetchedData = fetchStringElement(dialog, array, fetchedData.index, 1);
                    if (fetchedData.str) {
                        dialog.isFirst = false;
                        fetchedData.str !== undefined && dialog.setText('' + fetchedData.str);
                    }
                    else {
                        scene.setBackgroundImage(null); // GC it
                        game.popScene();
                        done = true;
                    }
                }
            }
            else if (pressed && !currentState) {
                pressed = false;
            }

            const moveBack = controller.B.isPressed() || controller.up.isPressed();
            if (moveBack && !upPressed) {
                upPressed = true;
                if (dialog.hasPrev()) {
                    dialog.prevPage();
                    dialog.isFirst = dialog.chunkIndex === 0;
                } else if (fetchedData.index > 0) {
                    fetchedData = fetchStringElement(dialog, array, fetchedData.index, -1, minStrIndex);
                    fetchedData.str !== undefined && dialog.setText('' + fetchedData.str);
                    dialog.chunkIndex = dialog.chunks.length - 1;
                    dialog.isFirst = fetchedData.index <= minStrIndex && dialog.chunkIndex === 0;
                    dialog.update();
                }
            }
            else if (upPressed && !moveBack) {
                upPressed = false;
            }
        })

        pauseUntil(() => done);
        controller._setUserEventsEnabled(true);
    }


    /**
     * Copied from https://github.com/microsoft/pxt-common-packages/blob/master/libs/game/numberprompt.ts
     * Ask the player for a number value with timer.
     * @param message The message to display on the text-entry screen
     * @param answerLength The maximum number of digits the user can enter (1 - 10)
     */
    //% weight=10 help=game/ask-for-number
    //% blockId=gameaskfornumberwithtimer block="ask for number %message with timer || and max length %answerLength"
    //% message.shadow=text
    //% message.defl=""
    //% answerLength.defl="6"
    //% answerLength.min=1
    //% answerLength.max=10
    //% group="Prompt"
    export function askForNumberWithTimer(message: any, answerLength = 6): number[] {
        answerLength = Math.max(0, Math.min(10, answerLength));
        let p = new CustomNumberPrompt();
        const result = p.show(console.inspect(message), answerLength);
        return result;
    }


    //% whenUsed=true
    const font = image.font8;
    //% whenUsed=true
    const PADDING_HORIZONTAL = 40;
    //% whenUsed=true
    const PADDING_VERTICAL = 4;
    //% whenUsed=true
    const PROMPT_LINE_SPACING = 2;

    //% whenUsed=true
    const NUM_LETTERS = 12;
    //% whenUsed=true
    const NUMPAD_ROW_LENGTH = 3;
    //% whenUsed=true
    const NUM_ROWS = Math.ceil(NUM_LETTERS / NUMPAD_ROW_LENGTH);
    //% whenUsed=true
    const INPUT_ROWS = 1;

    //% whenUsed=true
    const CONTENT_WIDTH = screen.width - PADDING_HORIZONTAL * 2;
    //% whenUsed=true
    const CONTENT_HEIGHT = screen.height - PADDING_VERTICAL * 2;
    //% whenUsed=true
    const CONTENT_TOP = PADDING_VERTICAL;

    // Dimensions of a "cell" that contains a letter
    //% whenUsed=true
    const CELL_HEIGHT = Math.floor(CONTENT_HEIGHT / (NUM_ROWS + 4));
    //% whenUsed=true
    const CELL_WIDTH = CELL_HEIGHT//Math.floor(CONTENT_WIDTH / NUMPAD_ROW_LENGTH);
    //% whenUsed=true
    const LETTER_OFFSET_X = Math.floor((CELL_WIDTH - font.charWidth) / 2);
    //% whenUsed=true
    const LETTER_OFFSET_Y = Math.floor((CELL_HEIGHT - font.charHeight) / 2);
    //% whenUsed=true
    const BLANK_PADDING = 1;
    //% whenUsed=true
    const ROW_LEFT = PADDING_HORIZONTAL + CELL_WIDTH / 2 + Math.floor((CONTENT_WIDTH - (CELL_WIDTH * NUMPAD_ROW_LENGTH)) / 2);

    // Dimensions of the bottom bar
    //% whenUsed=true
    const BOTTOM_BAR_NUMPAD_MARGIN = 4;
    //% whenUsed=true
    const BOTTOM_BAR_HEIGHT = PADDING_VERTICAL + BOTTOM_BAR_NUMPAD_MARGIN + CELL_HEIGHT;
    //% whenUsed=true
    const BOTTOM_BAR_TOP = screen.height - BOTTOM_BAR_HEIGHT;
    //% whenUsed=true
    const BOTTOM_BAR_BUTTON_WIDTH = PADDING_HORIZONTAL * 2 + font.charWidth * 3;
    //% whenUsed=true
    const BOTTOM_BAR_TEXT_Y = (BOTTOM_BAR_HEIGHT - font.charHeight) / 2;
    //% whenUsed=true
    const BOTTOM_BAR_CONFIRM_X = (BOTTOM_BAR_BUTTON_WIDTH - font.charWidth * 2) / 2;

    // Dimensions of the numpad area
    //% whenUsed=true
    const NUMPAD_HEIGHT = NUM_ROWS * CELL_HEIGHT;
    //% whenUsed=true
    const NUMPAD_TOP = screen.height - NUMPAD_HEIGHT - BOTTOM_BAR_HEIGHT;
    //% whenUsed=true
    const NUMPAD_INPUT_MARGIN = 4;

    // Dimensions of area where text is input
    //% whenUsed=true
    const INPUT_HEIGHT = INPUT_ROWS * CELL_HEIGHT;
    //% whenUsed=true
    const INPUT_TOP = NUMPAD_TOP - INPUT_HEIGHT - NUMPAD_INPUT_MARGIN;

    // Pixels kept blank on left and right sides of prompt
    //% whenUsed=true
    const PROMPT_MARGIN_HORIZ = 3;

    // Dimensions of prompt message area
    //% whenUsed=true
    const PROMPT_HEIGHT = INPUT_TOP - CONTENT_TOP;
    //% whenUsed=true
    const PROMPT_WIDTH = screen.width - PROMPT_MARGIN_HORIZ * 2

    const TIMER_PADDING_HORIZONTAL = 2;
    const TIMER_PADDING_VERTICAL = 2;
    const TOP_RIGHT_TIMER_WIDTH = TIMER_PADDING_HORIZONTAL * 2 + font.charWidth * 6;
    const TOP_RIGHT_TIMER_TEXT_X = (TOP_RIGHT_TIMER_WIDTH - font.charWidth * 6) / 2;
    const TOP_RIGHT_TIMER_HEIGHT = TIMER_PADDING_VERTICAL * 2 + font.charHeight;
    const TOP_RIGHT_TIMER_TEXT_Y = (TOP_RIGHT_TIMER_HEIGHT - font.charHeight) / 2;

    //% whenUsed=true
    const confirmText = "OK";

    export class CustomNumberPrompt {
        theme: game.PromptTheme;

        message: string;
        answerLength: number;
        result: string;

        private cursor: Sprite;
        private confirmButton: Sprite;
        private timer: Sprite;

        private numbers: Sprite[];
        private inputs: Sprite[];

        private confirmPressed: boolean;
        private cursorRow: number;
        private cursorColumn: number;
        private hasDecimal: boolean;
        private inputIndex: number;
        private blink: boolean;
        private frameCount: number;

        private startMilliSecs: number;
        private duration: number;

        constructor(theme?: game.PromptTheme) {
            if (theme) {
                this.theme = theme;
            }
            else {
                this.theme = {
                    colorPrompt: 1,
                    colorInput: 3,
                    colorInputHighlighted: 5,
                    colorInputText: 1,
                    colorAlphabet: 1,
                    colorCursor: 7,
                    colorBackground: 15,
                    colorBottomBackground: 3,
                    colorBottomText: 1,
                };
            }
            this.cursorRow = 0;
            this.cursorColumn = 0;
            this.hasDecimal = false;
            this.inputIndex = 0;
        }

        show(message: string, answerLength: number): number[] {
            this.message = message;
            this.answerLength = answerLength;
            this.inputIndex = 0;

            controller._setUserEventsEnabled(false);
            game.pushScene()

            this.draw();
            this.registerHandlers();
            this.confirmPressed = false;

            pauseUntil(() => this.confirmPressed);

            game.popScene();
            controller._setUserEventsEnabled(true);

            return [parseFloat(this.result), this.duration];
        }

        private draw() {
            this.drawPromptText();
            this.drawNumpad();
            this.drawInputarea();
            this.drawBottomBar();
            this.drawTimer();
        }

        private drawPromptText() {
            const prompt = sprites.create(layoutText(this.message, PROMPT_WIDTH, PROMPT_HEIGHT, this.theme.colorPrompt), -1);
            prompt.x = screen.width / 2
            prompt.y = CONTENT_TOP + Math.floor((PROMPT_HEIGHT - prompt.height) / 2) + Math.floor(prompt.height / 2);
        }

        private drawInputarea() {
            const answerLeft = (screen.width - this.answerLength * CELL_WIDTH) / 2

            this.inputs = [];
            for (let i = 0; i < this.answerLength; i++) {
                const blank = image.create(CELL_WIDTH, CELL_HEIGHT);
                this.drawInput(blank, "", this.theme.colorInput);

                const s = sprites.create(blank, -1);
                s.left = answerLeft + i * CELL_WIDTH;
                s.y = INPUT_TOP;
                this.inputs.push(s);
            }
        }

        private drawNumpad() {
            const cursorImage = image.create(CELL_WIDTH, CELL_HEIGHT);
            cursorImage.fill(this.theme.colorCursor);
            this.cursor = sprites.create(cursorImage, -1);
            this.cursor.z = -1;
            this.updateCursor();

            this.numbers = [];
            for (let j = 0; j < NUM_LETTERS; j++) {
                const letter = image.create(CELL_WIDTH, CELL_HEIGHT);

                const col2 = j % NUMPAD_ROW_LENGTH;
                const row2 = Math.floor(j / NUMPAD_ROW_LENGTH);

                const t = sprites.create(letter, -1);
                t.x = ROW_LEFT + col2 * CELL_WIDTH;
                t.y = NUMPAD_TOP + row2 * CELL_HEIGHT;

                this.numbers.push(t);
            }
            this.updateKeyboard();
        }

        private drawBottomBar() {
            const bg = image.create(screen.width, BOTTOM_BAR_HEIGHT);
            bg.fill(this.theme.colorBottomBackground);

            const bgSprite = sprites.create(bg, -1);
            bgSprite.x = screen.width / 2;
            bgSprite.y = BOTTOM_BAR_TOP + BOTTOM_BAR_HEIGHT / 2;
            bgSprite.z = -1;

            this.confirmButton = sprites.create(image.create(BOTTOM_BAR_BUTTON_WIDTH, BOTTOM_BAR_HEIGHT), -1);
            this.confirmButton.right = screen.width;
            this.confirmButton.y = BOTTOM_BAR_TOP + Math.ceil(BOTTOM_BAR_HEIGHT / 2);

            this.updateButtons();
        }

        private drawTimer() {
            this.startMilliSecs = game.runtime();
            this.duration = 0;
            this.timer = sprites.create(image.create(TOP_RIGHT_TIMER_WIDTH, TOP_RIGHT_TIMER_HEIGHT), -1);
            this.timer.left = 0;
            this.timer.bottom = screen.height;

            scene.createRenderable(
                scene.HUD_Z,
                () => {
                    this.updateTimer();
                }
            );
        }

        private updateButtons() {
            if (this.cursorRow === 4) {
                this.confirmButton.image.fill(this.theme.colorCursor);
            }
            else {
                this.confirmButton.image.fill(this.theme.colorBottomBackground);
            }

            this.confirmButton.image.print(confirmText, BOTTOM_BAR_CONFIRM_X, BOTTOM_BAR_TEXT_Y);
        }

        private updateCursor() {
            if (this.cursorRow === 4) {
                this.cursor.image.fill(0);
                this.updateButtons();
            }
            else {
                this.cursor.x = ROW_LEFT + this.cursorColumn * CELL_WIDTH;
                this.cursor.y = NUMPAD_TOP + this.cursorRow * CELL_HEIGHT;
            }
        }

        private updateSelectedInput() {
            if (this.inputIndex < this.answerLength) {
                const u = this.inputs[this.inputIndex];
                if (this.blink) {
                    this.drawInput(u.image, "", this.theme.colorInput);
                }
                else {
                    this.drawInput(u.image, "", this.theme.colorInputHighlighted)
                }
            }
        }

        private updateKeyboard() {
            const len = this.numbers.length;
            for (let k = 0; k < len; k++) {
                const img = this.numbers[k].image;
                img.fill(0);
                img.print(getSymbolFromIndex(k), LETTER_OFFSET_X, LETTER_OFFSET_Y);
            }
        }

        private updateTimer() {
            this.timer.image.fill(this.theme.colorBottomBackground);
            const currentMilliSecs = game.runtime();
            const diffMilliSecs = currentMilliSecs - this.startMilliSecs;
            const durationSecs = Math.floor((diffMilliSecs) / 1000);
            let durationSecsStr = durationSecs.toString();
            if (durationSecs < 10) durationSecsStr = `00${durationSecsStr}`;
            else if (durationSecs < 100) durationSecsStr = `0${durationSecsStr}`;
 
            const durationMilliSecs = diffMilliSecs - durationSecs * 1000;
            let durationMilliSecsStr = durationMilliSecs.toString();
            if (durationMilliSecs < 10) durationMilliSecsStr = `00${durationMilliSecsStr}`;
            else if (durationMilliSecs < 100) durationMilliSecsStr = `0${durationMilliSecsStr}`;
 
            this.timer.image.print(
                `${durationSecsStr}.${durationMilliSecsStr.substr(0, 2)}`,
                TOP_RIGHT_TIMER_TEXT_X, TOP_RIGHT_TIMER_TEXT_Y);
        }

        private drawInput(img: Image, char: string, color: number) {
            img.fill(0);
            img.fillRect(BLANK_PADDING, CELL_HEIGHT - 1, CELL_WIDTH - BLANK_PADDING * 2, 1, color)

            if (char) {
                img.print(char, LETTER_OFFSET_X, LETTER_OFFSET_Y, this.theme.colorInputText, font);
            }
        }

        private registerHandlers() {
            controller.up.onEvent(SYSTEM_KEY_DOWN, () => {
                this.moveVertical(true);
            })

            controller.down.onEvent(SYSTEM_KEY_DOWN, () => {
                this.moveVertical(false);
            })

            controller.right.onEvent(SYSTEM_KEY_DOWN, () => {
                this.moveHorizontal(true);
            });

            controller.left.onEvent(SYSTEM_KEY_DOWN, () => {
                this.moveHorizontal(false);
            });

            controller.A.onEvent(SYSTEM_KEY_DOWN, () => {
                this.confirm();
            });

            controller.B.onEvent(SYSTEM_KEY_DOWN, () => {
                this.delete();
            });


            this.frameCount = 0;
            this.blink = true;

            game.onUpdate(() => {
                this.frameCount = (this.frameCount + 1) % 30;

                if (this.frameCount === 0) {
                    this.blink = !this.blink;

                    this.updateSelectedInput();

                    //this.updateTimer();
                }
            })
        }

        private moveVertical(up: boolean) {
            if (up) {
                if (this.cursorRow === 4) {
                    this.cursor.image.fill(this.theme.colorCursor);
                    this.cursorRow = 3;

                    this.updateButtons();
                }
                else {
                    this.cursorRow = Math.max(0, this.cursorRow - 1);
                }
            }
            else {
                this.cursorRow = Math.min(4, this.cursorRow + 1);
            }

            this.updateCursor();
        }

        private moveHorizontal(right: boolean) {
            if (right) {
                this.cursorColumn = (this.cursorColumn + 1) % NUMPAD_ROW_LENGTH;
            }
            else {
                this.cursorColumn = (this.cursorColumn + (NUMPAD_ROW_LENGTH - 1)) % NUMPAD_ROW_LENGTH;
            }

            this.updateCursor();
        }

        private confirm() {
            if (this.cursorRow === 4) {
                this.duration = game.runtime() - this.startMilliSecs;
                this.confirmPressed = true;
            } else {
                if (this.inputIndex >= this.answerLength) return;

                const index = this.cursorColumn + this.cursorRow * NUMPAD_ROW_LENGTH
                const letter = getSymbolFromIndex(index);

                if (letter === ".") {
                    if (this.hasDecimal) {
                        return;
                    } else {
                        this.hasDecimal = true;
                    }
                }

                if (letter === "-" && (this.result && this.result.length > 0)) {
                    return;
                }

                if (!this.result) {
                    this.result = letter;
                }
                else {
                    this.result += letter;
                }

                const sprite = this.inputs[this.inputIndex];
                this.changeInputIndex(1);
                this.drawInput(sprite.image, letter, this.theme.colorInput);
            }
        }

        private delete() {
            if (this.inputIndex <= 0) return;

            if (this.inputIndex < this.answerLength) {
                this.drawInput(this.inputs[this.inputIndex].image, "", this.theme.colorInput);
            }

            if (this.result.charAt(this.result.length - 1) === ".") {
                this.hasDecimal = false;
            }

            this.result = this.result.substr(0, this.result.length - 1);

            this.changeInputIndex(-1);
        }

        private changeInputIndex(delta: number) {
            this.inputIndex += delta;
            this.frameCount = 0
            this.blink = false;
            this.updateSelectedInput();
        }
    }

    function layoutText(message: string, width: number, height: number, color: number) {
        const lineHeight = font.charHeight + PROMPT_LINE_SPACING;

        const lineLength = Math.floor(width / font.charWidth);
        const numLines = Math.floor(height / lineHeight);

        let lines: string[] = [];
        let word: string;
        let line: string;

        let pushWord = () => {
            if (line) {
                if (line.length + word.length + 1 > lineLength) {
                    lines.push(line);
                    line = word;
                }
                else {
                    line = line + " " + word;
                }
            }
            else {
                line = word;
            }

            word = null;
        }

        for (let l = 0; l < message.length; l++) {
            const char = message.charAt(l);

            if (char === " ") {
                if (word) {
                    pushWord();
                }
                else {
                    word = " ";
                }
            }
            else if (!word) {
                word = char;
            }
            else {
                word += char;
            }
        }

        if (word) {
            pushWord();
        }

        if (line) {
            lines.push(line);
        }

        let maxLineWidth = 0;
        for (let m = 0; m < lines.length; m++) {
            maxLineWidth = Math.max(maxLineWidth, lines[m].length);
        }

        const actualWidth = maxLineWidth * font.charWidth;
        const actualHeight = lines.length * lineHeight;

        const res = image.create(actualWidth, actualHeight);

        for (let n = 0; n < lines.length; n++) {
            if ((n + 1) > numLines) break;
            res.print(lines[n], 0, n * lineHeight, color, font);
        }

        return res;
    }

    function getSymbolFromIndex(index: number) {
        if (index < 9) {
            // Calculator Layout
            return "" + (3 * Math.idiv(9 - index - 1, 3) + index % 3 + 1);
        } else if (index == 9) {
            return "-";
        } else if (index == 10) {
            return "0";
        } else if (index == 11) {
            return ".";
        } else {
            return "";
        }
    }

}