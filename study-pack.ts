//% color="#AA278D" icon="\uf303" block="Studyパック"
namespace studyPack {
    class CustomDialog extends game.Dialog {
        isFirst: boolean;

        constructor(width: number, height: number, frame?: Image, font?: image.Font, cursor?: Image) {
            super(width, height, frame, font, cursor);
            this.isFirst = true;
        }

        drawCursorRow() {
            let offset = 0;
            if (this.cursorCount > 20) {
                offset = 1;
            }

            this.cursorCount = (this.cursorCount + 1) % 40;

            const aButton: Image = img`
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

            const bButton: Image = img`
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
                this.innerLeft + this.textAreaWidth() + this.unit + offset - this.cursor.width - 16,
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
    //% block="show long texts %array %layout"
    //% array.shadow="lists_create_with"
    //% array.defl="text"
    export function showTexts<T>(array: T[], layout: DialogLayout) {
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

        const dialog = new CustomDialog(width, height);
        const s = sprites.create(dialog.image, -1);
        s.top = top;
        s.left = left;
        s.z = 10;
        let sceneSprite: Sprite | null = null;

        const fetchStringElement = (dialog: CustomDialog, strs: T[], index: number, diff: number) => {
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
            return {str: str, index: index};
        };

        let fetchedData = fetchStringElement(dialog, array, -1, 1);
        fetchedData.str !== undefined && dialog.setText('' + fetchedData.str);
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
                    fetchedData = fetchStringElement(dialog, array, fetchedData.index, -1);
                    fetchedData.str !== undefined && dialog.setText('' + fetchedData.str);
                    dialog.chunkIndex = dialog.chunks.length - 1;
                    dialog.isFirst = fetchedData.index === 0 && dialog.chunkIndex === 0;
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
}
