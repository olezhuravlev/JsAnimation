
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
    x: number;
    y: number;
    width: number;
    height: number;
}

interface SpriteAnimation {
    location: SpriteCoords[];
}

export interface SpriteAnimations {
    [key: string]: SpriteAnimation;
}

export interface Props {
    type: string,
    state: string,
    animationStates: SpriteAnimations,
    x: number,
    y: number,
    dest_X: number,
    dest_Y: number,
    speed_X: number,
    speed_Y: number,
}

export class Factory {

    images: HTMLImageElement[] = [];

    constructor(props: Props) {
        this.loadImages().then(() => {
            console.log('ALL IMAGES LOADED BY THE FABRIC!');
        })
    }

    create(props: Props): Creature {

        let phases: StatePhase[] = [];
        if (props.type == "dog") {
            phases = this.dogPhases;
        } else if (props.type == "enemy1") {
            phases = this.enemy1Phases;
        } else if (props.type == "enemy2") {
            phases = this.enemy2Phases;
        } else if (props.type == "enemy3") {
            phases = this.enemy3Phases;
        } else if (props.type == "enemy4") {
            phases = this.enemy4Phases;
        }

        props.animationStates = fillInSpriteAnimations(phases);
        return new Creature(props);
    }

    loadImage = async (element: HTMLImageElement, path: string) => {
        element.src = path;
        this.images.push(element);
    }

    loadImages = async () => {

        console.log("===> *** LOADING IMAGES ***");

        try {
            await Promise.all([
                this.loadImage(new Image(), playerImageSrc),
                this.loadImage(new Image(), enemy1ImageSrc),
                this.loadImage(new Image(), enemy2ImageSrc),
                this.loadImage(new Image(), enemy3ImageSrc),
                this.loadImage(new Image(), enemy4ImageSrc),
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

    x: number = 0;
    y: number = 0;
    dest_X: number = 0;
    dest_Y: number = 0;
    speed_X: number = 0;
    speed_Y: number = 0;
    state: string = "";
    animationStates: SpriteAnimations = {};

    // Index of phase picture to show.
    phase: number = 0;

    constructor(props: Props) {
        this.x = props.x;
        this.y = props.y;
        this.dest_X = props.dest_X;
        this.dest_Y = props.dest_Y;
        this.speed_X = props.speed_X;
        this.speed_Y = props.speed_Y;
        this.state = props.state;
        this.animationStates = props.animationStates;
    }

    setDestination(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    setSpeed(x: number, y: number) {
        this.speed_X = x;
        this.speed_Y = y;
    }

    move() {

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
        //
        // // Enemy1
        // const currentEnemy1Animation = enemy1SpriteAnimationsRef.current[enemy1State];
        // if (!currentEnemy1Animation) {
        //     animationIdRef.current = requestAnimationFrame(animate);
        //     return;
        // }
        // const enemy1SpritesLocationArr: SpriteCoords[] = currentEnemy1Animation.location;
        // const enemy1SpriteCoordinates = enemy1SpritesLocationArr[enemy1SpritePhaseToShowIdxRef.current++];
        //
        // // Enemy2
        // const currentEnemy2Animation = enemy2SpriteAnimationsRef.current[enemy2State];
        // if (!currentEnemy2Animation) {
        //     animationIdRef.current = requestAnimationFrame(animate);
        //     return;
        // }
        // const enemy2SpritesLocationArr: SpriteCoords[] = currentEnemy2Animation.location;
        // const enemy2SpriteCoordinates = enemy2SpritesLocationArr[enemy2SpritePhaseToShowIdxRef.current++];
        //
        // // Enemy3
        // const currentEnemy3Animation = enemy3SpriteAnimationsRef.current[enemy3State];
        // if (!currentEnemy3Animation) {
        //     animationIdRef.current = requestAnimationFrame(animate);
        //     return;
        // }
        // const enemy3SpritesLocationArr: SpriteCoords[] = currentEnemy3Animation.location;
        // const enemy3SpriteCoordinates = enemy3SpritesLocationArr[enemy3SpritePhaseToShowIdxRef.current++];
        //
        // // Enemy4
        // const currentEnemy4Animation = enemy4SpriteAnimationsRef.current[enemy4State];
        // if (!currentEnemy4Animation) {
        //     animationIdRef.current = requestAnimationFrame(animate);
        //     return;
        // }
        // const enemy4SpritesLocationArr: SpriteCoords[] = currentEnemy4Animation.location;
        // const enemy4SpriteCoordinates = enemy4SpritesLocationArr[enemy4SpritePhaseToShowIdxRef.current++];

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
