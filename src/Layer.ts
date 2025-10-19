import {RefObject} from "react";

export class Layer {

    private canvasRef: RefObject<HTMLCanvasElement>;
    private ctx: CanvasRenderingContext2D | null = null;

    private id: string;
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private x2: number;
    private imageRef: RefObject<HTMLImageElement>;
    private stepWidth: number;
    private speedModifier: number;

    constructor(id: string, canvasRef: RefObject<HTMLCanvasElement>, imageRef: RefObject<HTMLImageElement>, stepWidth: number, speedModifier: number) {
        this.id = id;
        this.canvasRef = canvasRef;
        this.x = 0;
        this.y = 0;
        this.width = 2400;
        this.height = 700;
        this.x2 = this.width;
        this.imageRef = imageRef;
        this.stepWidth = stepWidth;
        this.speedModifier = speedModifier;

        console.log("LAYER CONSTRUCTOR!");
    }

    changeGameSpeed(stepWidth: number,) {
        this.stepWidth = stepWidth;
    }

    update() {

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

        if (!this.ctx) {
            this.ctx = this.canvasRef.current.getContext('2d');
        }
        if (this.ctx) {
            this.ctx.drawImage(this.imageRef.current, this.x, this.y, this.width, this.height);
            this.ctx.drawImage(this.imageRef.current, this.x2, this.y, this.width, this.height);
        }
    }
}