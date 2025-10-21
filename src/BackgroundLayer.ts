export class BackgroundLayer {

    private ctx: CanvasRenderingContext2D;

    private id: string;
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private x2: number;
    private imageRef: HTMLImageElement;
    private stepWidth: number;
    private speedModifier: number;

    constructor(id: string, image: HTMLImageElement, stepWidth: number, speedModifier: number, canvasCtx: CanvasRenderingContext2D,) {

        console.log(`LAYER ${id} CONSTRUCTOR!`);

        this.id = id;
        this.x = 0;
        this.y = 0;
        this.width = 2400;
        this.height = 700;
        this.x2 = this.width;
        this.imageRef = image;
        this.stepWidth = stepWidth;
        this.speedModifier = speedModifier;

        this.ctx = canvasCtx;
    }

    changeGameSpeed(stepWidth: number,) {
        this.stepWidth = stepWidth;
    }

    updatePosition() {

        //console.log(`LAYER ${this.id} UPDATE!`);

        const offset = Math.floor(this.stepWidth * this.speedModifier);

        // Make another step by "offset" pixels.
        if (this.x <= -this.width) {
            this.x = this.x2 + this.width - offset;
        } else {
            this.x -= offset;
        }

        if (this.x2 <= -this.width) {
            this.x2 = this.x + this.width - offset;
        } else {
            this.x2 -= offset;
        }

        this.x = Math.floor(this.x);
        this.x2 = Math.floor(this.x2);

        return this;
    }

    draw() {
        //console.log("DRAW!");
        if (this.ctx) {
            this.ctx.drawImage(this.imageRef, this.x, this.y, this.width, this.height);
            this.ctx.drawImage(this.imageRef, this.x2, this.y, this.width, this.height);
        } else {
            console.error(`No canvas context for background layer ${this.id}!`);
        }
    }
}