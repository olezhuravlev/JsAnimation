const playerImageSrc = '/image/png/shadow_dog.png';
const enemy1ImageSrc = '/image/png/enemy1.png';
const enemy2ImageSrc = '/image/png/enemy2.png';
const enemy3ImageSrc = '/image/png/enemy3.png';
const enemy4ImageSrc = '/image/png/enemy4.png';

// Image phases for each sprite sequence.
export interface StatePhase {
    name: string,
    framesCount: number,
    width: number,
    height: number,
}

export interface SpriteCoords {

    // Positions of the sprite on the source picture.
    x: number;
    y: number;

    // Positions of the sprite positions on the source picture.
    width: number;
    height: number;
}

interface SpriteAnimation {
    location: SpriteCoords[];
}

export interface SpriteAnimations {
    [key: string]: SpriteAnimation;
}

export interface CreatureProps {
    type: string,
    state: string,
    spriteAnimations: SpriteAnimations,
    x: number,
    y: number,
    dest_X: number,
    dest_Y: number,
    speed_X: number,
    speed_Y: number,
    scale: number,
}

export interface CreatureImages {
    [key: string]: HTMLImageElement;
}

export class Factory {

    ctx: CanvasRenderingContext2D;
    images: CreatureImages = {};

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.loadImages().then(() => {
            console.log('ALL IMAGES LOADED BY THE FABRIC!');
        })
    }

    create(type: string, state: string,
           x: number, y: number,
           dest_X: number, dest_Y: number,
           speed_X: number, speed_Y: number, scale: number): Creature {

        let phases: StatePhase[] = [];
        let image: HTMLImageElement;
        if (type == "player0") {
            phases = this.dogPhases;
        } else if (type == "enemy1") {
            phases = this.enemy1Phases;
        } else if (type == "enemy2") {
            phases = this.enemy2Phases;
        } else if (type == "enemy3") {
            phases = this.enemy3Phases;
        } else if (type == "enemy4") {
            phases = this.enemy4Phases;
        }

        const props: CreatureProps = {
            type: type,
            state: state,
            spriteAnimations: fillInSpriteAnimations(phases),
            x: x,
            y: x,
            dest_X: dest_X,
            dest_Y: dest_Y,
            speed_X: speed_X,
            speed_Y: speed_Y,
            scale: scale
        }

        return new Creature(this.ctx, this.images[type], props);
    }

    loadImage = async (type: string, path: string) => {
        const element: HTMLImageElement = new Image();
        element.src = path;
        this.images[type] = element;
    }

    loadImages = async () => {

        console.log("===> *** LOADING IMAGES ***");

        try {
            await Promise.all([
                this.loadImage("player0", playerImageSrc),
                this.loadImage("enemy1", enemy1ImageSrc),
                this.loadImage("enemy2", enemy2ImageSrc),
                this.loadImage("enemy3", enemy3ImageSrc),
                this.loadImage("enemy4", enemy4ImageSrc),
            ]);
            console.log("===> ALL BACKGROUND IMAGES LOADED SUCCESSFULLY");
        } catch (error) {
            console.error("===> SOME IMAGES FAILED TO LOAD:", error);
        }
    }

    // loadImage = (imageRef: HTMLImageElement, imageSrc: string, title: string): Promise<void> => {
    //
    //     return new Promise((resolve, reject) => {
    //
    //         if (!imageRef) {
    //             reject(new Error(`IMAGE REF FOR ${title} IN NULL!`));
    //             return;
    //         }
    //
    //         imageRef.onload = () => {
    //             console.log(`===> IMAGE ${title} LOADED`);
    //             resolve();
    //         }
    //         imageRef.onerror = () => {
    //             const msg: string = `===> FAILED TO LOAD IMAGE ${title}!`;
    //             console.error(msg);
    //             reject(new Error(msg));
    //         };
    //
    //         imageRef.src = imageSrc;
    //     })
    // }

    dogPhases: StatePhase[] = [
        {
            name: 'idle',
            framesCount: 7,
            width: 575,
            height: 523
        },
        {
            name: 'jump',
            framesCount: 7,
            width: 575,
            height: 523
        },
        {
            name: 'fall',
            framesCount: 7,
            width: 575,
            height: 523
        },
        {
            name: 'run',
            framesCount: 9,
            width: 575,
            height: 523
        },
        {
            name: 'dizzy',
            framesCount: 11,
            width: 575,
            height: 523
        },
        {
            name: 'sit',
            framesCount: 5,
            width: 575,
            height: 523
        },
        {
            name: 'roll',
            framesCount: 7,
            width: 575,
            height: 523
        },
        {
            name: 'bite',
            framesCount: 7,
            width: 575,
            height: 523
        },
        {
            name: 'ko',
            framesCount: 12,
            width: 575,
            height: 523
        },
        {
            name: 'hit',
            framesCount: 4,
            width: 575,
            height: 523
        }
    ];

    enemy1Phases: StatePhase[] = [
        {
            name: 'run',
            framesCount: 6,
            width: 293,
            height: 155
        }
    ];

    enemy2Phases: StatePhase[] = [
        {
            name: 'run',
            framesCount: 6,
            width: 266,
            height: 188
        }
    ];

    enemy3Phases: StatePhase[] = [
        {
            name: 'run',
            framesCount: 6,
            width: 218,
            height: 177
        }
    ];

    enemy4Phases: StatePhase[] = [
        {
            name: 'run',
            framesCount: 9,
            width: 213,
            height: 212
        }
    ];
}

export class Creature {

    ctx: CanvasRenderingContext2D;

    // Source images.
    sourceImage: HTMLImageElement;

    x: number = 0;
    y: number = 0;
    dest_X: number = 0;
    dest_Y: number = 0;
    speed_X: number = 0;
    speed_Y: number = 0;
    state: string = "";

    // Size scale source-to-destination;
    scale: number = 1;

    spriteAnimations: SpriteAnimations = {};
    currentAnimationPhase: number = 0;

    // Index of phase picture to show.
    phase: number = 0;


    constructor(ctx: CanvasRenderingContext2D, image: HTMLImageElement, props: CreatureProps) {

        this.ctx = ctx;
        this.sourceImage = image;

        this.x = props.x;
        this.y = props.y;
        this.dest_X = props.dest_X;
        this.dest_Y = props.dest_Y;
        this.speed_X = props.speed_X;
        this.speed_Y = props.speed_Y;
        this.state = props.state;

        this.scale = props.scale;

        this.spriteAnimations = props.spriteAnimations;
        this.currentAnimationPhase = 0;
    }

    setDestination(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    setSpeed(x: number, y: number) {
        this.speed_X = x;
        this.speed_Y = y;
    }

    updatePosition() {

        console.log("Creature move", this.x, this.y);

        // Remained path to travel.
        let dist_X: number = this.dest_X - this.x;
        let dist_Y: number = this.dest_Y - this.y;

        // Angle of the travel.
        let slope: number = dist_Y / dist_X;

        // Direction of the travel.
        let direction_X: number = 1;
        if (dist_X < 0) {
            direction_X = -1;
        }
        let delta_X: number = direction_X * this.speed_X;

        let direction_Y: number = 1;
        if (dist_Y < 0) {
            direction_Y = -1;
        }
        let delta_Y: number = delta_X * slope * direction_Y * this.speed_Y;

        // New coords.
        this.x += delta_X;
        this.y += delta_Y;

        return this;
        // Change current sprite phase.
        // if (playerSpritePhaseToShowIdxRef.current >= playerSpritesLocationArr.length) {
        //     playerSpritePhaseToShowIdxRef.current = 0;
        // }


        // Dog
        // const currentPlayerAnimation = playerSpriteAnimationsRef.current[playerState];
        // if (!currentPlayerAnimation) {
        //     animationIdRef.current = requestAnimationFrame(animate);
        //     return;
        // }
        // const playerSpritesLocationArr: SpriteCoords[] = currentPlayerAnimation.location;
        // const playerSpriteCoordinates = playerSpritesLocationArr[playerSpritePhaseToShowIdxRef.current++];

        // // Enemy1
        // const currentEnemy1Animation = enemy1SpriteAnimationsRef.current[enemy1State];
        // if (!currentEnemy1Animation) {
        //     animationIdRef.current = requestAnimationFrame(animate);
        //     return;
        // }
        // const enemy1SpritesLocationArr: SpriteCoords[] = currentEnemy1Animation.location;
        // const enemy1SpriteCoordinates = enemy1SpritesLocationArr[enemy1SpritePhaseToShowIdxRef.current++];
    }

    draw() {

        //console.log("DRAW!");

        const spriteAnimation: SpriteAnimation = this.spriteAnimations[this.state];
        const location: SpriteCoords[] = spriteAnimation.location;
        const coords: SpriteCoords = location[this.currentAnimationPhase++];
        if (this.currentAnimationPhase >= location.length) {
            this.currentAnimationPhase = 0;
        }
        this.ctx.drawImage(this.sourceImage, coords.x, coords.y, coords.width, coords.height, this.x, this.y, coords.width / this.scale, coords.height / this.scale);
    }
}

const fillInSpriteAnimations = (phases: StatePhase[]): SpriteAnimations => {

    const spriteAnimations: SpriteAnimations = {};

    phases.forEach((state: StatePhase, idx: number) => {
        let frames = {
            location: [] as SpriteCoords[],
        }
        for (let frameIdx = 0; frameIdx < state.framesCount; frameIdx++) {
            let positionX = frameIdx * state.width;
            let positionY = idx * state.height;
            frames.location.push({
                x: positionX,
                y: positionY,
                width: state.width,
                height: state.height
            });
        }
        spriteAnimations[state.name] = frames;
    })

    return spriteAnimations;
}
