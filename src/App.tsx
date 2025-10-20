import React, {RefObject, useEffect, useRef, useState} from 'react';
import './App.css';
import {Layer} from "./Layer";
import {dogPhases, enemy1Phases, enemy2Phases, enemy3Phases, enemy4Phases, fillSpriteAnimations} from "./Creature";

// Case 1: The image is in 'public' folder.
const playerImageSrc = '/image/png/shadow_dog.png';

const enemy1ImageSrc = '/image/png/enemy1.png';
const enemy2ImageSrc = '/image/png/enemy2.png';
const enemy3ImageSrc = '/image/png/enemy3.png';
const enemy4ImageSrc = '/image/png/enemy4.png';

const backgroundImageSrc_1 = '/image/png/layer-1.png';
const backgroundImageSrc_2 = '/image/png/layer-2.png';
const backgroundImageSrc_3 = '/image/png/layer-3.png';
const backgroundImageSrc_4 = '/image/png/layer-4.png';
const backgroundImageSrc_5 = '/image/png/layer-5.png';

// Case 2: The image is in 'src' folder (import needed).
// import playerImageSrc from './image/png/shadow_dog.png';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 700;

const FROZEN_FRAMES = 3;
const GAME_SPEED_INITIAL = 13;

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

function App() {

    // useState - invokes rerender.
    // Ref - keeps state until the page refreshed. Doesn't invoke rerender.

    // Row of images to show.
    const [playerState, setPlayerState] = useState("run");
    const [enemy1State, setEnemy1State] = useState("run");
    const [enemy2State, setEnemy2State] = useState("run");
    const [enemy3State, setEnemy3State] = useState("run");
    const [enemy4State, setEnemy4State] = useState("run");

    // Game scrolling speed.
    const [gameSpeed, setGameSpeed] = useState<number>(GAME_SPEED_INITIAL);

    // Canvas itself.
    const canvasRef = useRef<HTMLCanvasElement>(null as unknown as HTMLCanvasElement);

    // FPS control time.
    const lastTimestampRef = useRef<number>(0);

    // Counter to drop frozen frames.
    const frameCounterRef = useRef<number>(0);

    // Source image for all sprites.
    const playerImageRef = useRef<HTMLImageElement>(new Image());
    const enemy1ImageRef = useRef<HTMLImageElement>(new Image());
    const enemy2ImageRef = useRef<HTMLImageElement>(new Image());
    const enemy3ImageRef = useRef<HTMLImageElement>(new Image());
    const enemy4ImageRef = useRef<HTMLImageElement>(new Image());

    const backgroundImageRef_1 = useRef<HTMLImageElement>(new Image());
    const backgroundImageRef_2 = useRef<HTMLImageElement>(new Image());
    const backgroundImageRef_3 = useRef<HTMLImageElement>(new Image());
    const backgroundImageRef_4 = useRef<HTMLImageElement>(new Image());
    const backgroundImageRef_5 = useRef<HTMLImageElement>(new Image());

    const layersRef = useRef<Layer[]>([]);

    const dogAnimationStatesRef = useRef<StatePhase[]>(dogPhases);
    const enemy1AnimationStatesRef = useRef<StatePhase[]>(enemy1Phases);
    const enemy2AnimationStatesRef = useRef<StatePhase[]>(enemy2Phases);
    const enemy3AnimationStatesRef = useRef<StatePhase[]>(enemy3Phases);
    const enemy4AnimationStatesRef = useRef<StatePhase[]>(enemy4Phases);

    const playerSpriteAnimationsRef = useRef<SpriteAnimations>({});
    const enemy1SpriteAnimationsRef = useRef<SpriteAnimations>({});
    const enemy2SpriteAnimationsRef = useRef<SpriteAnimations>({});
    const enemy3SpriteAnimationsRef = useRef<SpriteAnimations>({});
    const enemy4SpriteAnimationsRef = useRef<SpriteAnimations>({});

    // To show render events.
    const renderCountRef = useRef(0);

    // Index of phase picture to show.
    const playerSpritePhaseToShowIdxRef = useRef(0);
    const enemy1SpritePhaseToShowIdxRef = useRef(0);
    const enemy2SpritePhaseToShowIdxRef = useRef(0);
    const enemy3SpritePhaseToShowIdxRef = useRef(0);
    const enemy4SpritePhaseToShowIdxRef = useRef(0);

    const animationIdRef = useRef<number>(0);

    // Fill in sprite positions array.
    const fillDogAnimations = () => fillSpriteAnimations(dogAnimationStatesRef, playerSpriteAnimationsRef);
    const fillEnemy1Animations = () => fillSpriteAnimations(enemy1AnimationStatesRef, enemy1SpriteAnimationsRef);
    const fillEnemy2Animations = () => fillSpriteAnimations(enemy2AnimationStatesRef, enemy2SpriteAnimationsRef);
    const fillEnemy3Animations = () => fillSpriteAnimations(enemy3AnimationStatesRef, enemy3SpriteAnimationsRef);
    const fillEnemy4Animations = () => fillSpriteAnimations(enemy4AnimationStatesRef, enemy4SpriteAnimationsRef);

    const animate = (timestamp: number) => {

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const playerImage = playerImageRef.current;
        const enemy1Image = enemy1ImageRef.current;
        const enemy2Image = enemy2ImageRef.current;
        const enemy3Image = enemy3ImageRef.current;
        const enemy4Image = enemy4ImageRef.current;

        // Skip the frame if the image not loaded.
        if (!playerImage.complete || !enemy1Image.complete) {
            console.log('Image not completed!');
            animationIdRef.current = requestAnimationFrame(animate);
            return;
        }

        // FPS control.
        const deltaTime = timestamp - lastTimestampRef.current;
        if (deltaTime < 16) {
            animationIdRef.current = requestAnimationFrame(animate);
            return;
        }
        lastTimestampRef.current = timestamp;

        // Only each N-frame must be redrawn.
        ++frameCounterRef.current;
        if (frameCounterRef.current % FROZEN_FRAMES === 0) {

            // Dog
            const currentPlayerAnimation = playerSpriteAnimationsRef.current[playerState];
            if (!currentPlayerAnimation) {
                animationIdRef.current = requestAnimationFrame(animate);
                return;
            }
            const playerSpritesLocationArr: SpriteCoords[] = currentPlayerAnimation.location;
            const playerSpriteCoordinates = playerSpritesLocationArr[playerSpritePhaseToShowIdxRef.current++];

            // Enemy1
            const currentEnemy1Animation = enemy1SpriteAnimationsRef.current[enemy1State];
            if (!currentEnemy1Animation) {
                animationIdRef.current = requestAnimationFrame(animate);
                return;
            }
            const enemy1SpritesLocationArr: SpriteCoords[] = currentEnemy1Animation.location;
            const enemy1SpriteCoordinates = enemy1SpritesLocationArr[enemy1SpritePhaseToShowIdxRef.current++];

            // Enemy2
            const currentEnemy2Animation = enemy2SpriteAnimationsRef.current[enemy2State];
            if (!currentEnemy2Animation) {
                animationIdRef.current = requestAnimationFrame(animate);
                return;
            }
            const enemy2SpritesLocationArr: SpriteCoords[] = currentEnemy2Animation.location;
            const enemy2SpriteCoordinates = enemy2SpritesLocationArr[enemy2SpritePhaseToShowIdxRef.current++];

            // Enemy3
            const currentEnemy3Animation = enemy3SpriteAnimationsRef.current[enemy3State];
            if (!currentEnemy3Animation) {
                animationIdRef.current = requestAnimationFrame(animate);
                return;
            }
            const enemy3SpritesLocationArr: SpriteCoords[] = currentEnemy3Animation.location;
            const enemy3SpriteCoordinates = enemy3SpritesLocationArr[enemy3SpritePhaseToShowIdxRef.current++];

            // Enemy4
            const currentEnemy4Animation = enemy4SpriteAnimationsRef.current[enemy4State];
            if (!currentEnemy4Animation) {
                animationIdRef.current = requestAnimationFrame(animate);
                return;
            }
            const enemy4SpritesLocationArr: SpriteCoords[] = currentEnemy4Animation.location;
            const enemy4SpriteCoordinates = enemy4SpritesLocationArr[enemy4SpritePhaseToShowIdxRef.current++];


            if (ctx && playerSpriteCoordinates) {

                ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

                // Draw the backgrounds.
                if (layersRef.current && layersRef.current.length > 0) {
                    layersRef.current.forEach(layer => layer.update().draw())
                } else {
                    console.log("NO BACKGROUND LAYERS!");
                }

                // Draw the dog.
                ctx.drawImage(playerImage, playerSpriteCoordinates.x, playerSpriteCoordinates.y, playerSpriteCoordinates.width, playerSpriteCoordinates.height, 300, 460, CANVAS_WIDTH / 5, CANVAS_HEIGHT / 5);

                // Draw the enemies.
                ctx.drawImage(enemy1Image, enemy1SpriteCoordinates.x, enemy1SpriteCoordinates.y, enemy1SpriteCoordinates.width, enemy1SpriteCoordinates.height, 600, 100, 293/3, 155/3);
                ctx.drawImage(enemy2Image, enemy2SpriteCoordinates.x, enemy2SpriteCoordinates.y, enemy2SpriteCoordinates.width, enemy2SpriteCoordinates.height, 600, 200, 293/3, 155/3);
                ctx.drawImage(enemy3Image, enemy3SpriteCoordinates.x, enemy3SpriteCoordinates.y, enemy3SpriteCoordinates.width, enemy3SpriteCoordinates.height, 600, 300, 293/3, 155/3);
                ctx.drawImage(enemy4Image, enemy4SpriteCoordinates.x, enemy4SpriteCoordinates.y, enemy4SpriteCoordinates.width, enemy4SpriteCoordinates.height, 600, 400, 293/3, 155/3);
            } else {
                console.log("NO ctx OR spriteCoordinates");
            }

            if (playerSpritePhaseToShowIdxRef.current >= playerSpritesLocationArr.length) {
                playerSpritePhaseToShowIdxRef.current = 0;
            }

            if (enemy1SpritePhaseToShowIdxRef.current >= enemy1SpritesLocationArr.length) {
                enemy1SpritePhaseToShowIdxRef.current = 0;
            }

            if (enemy2SpritePhaseToShowIdxRef.current >= enemy2SpritesLocationArr.length) {
                enemy2SpritePhaseToShowIdxRef.current = 0;
            }

            if (enemy3SpritePhaseToShowIdxRef.current >= enemy3SpritesLocationArr.length) {
                enemy3SpritePhaseToShowIdxRef.current = 0;
            }

            if (enemy4SpritePhaseToShowIdxRef.current >= enemy4SpritesLocationArr.length) {
                enemy4SpritePhaseToShowIdxRef.current = 0;
            }
        }

        animationIdRef.current = requestAnimationFrame(animate);
    }

    const startAnimation = () => {

        if (!canvasRef.current) {
            console.log("No Canvas!");
        }

        if (!backgroundImageRef_1.current) {
            console.log("No Background image!");
        }

        if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
        }
        animationIdRef.current = requestAnimationFrame(animate);
    }

    const loadImage = (imageRef: RefObject<HTMLImageElement>, imageSrc: string, title: string): Promise<void> => {

        return new Promise((resolve, reject) => {

            if (!imageRef.current) {
                reject(new Error(`IMAGE REF FOR ${title} IN NULL!`));
                return;
            }

            imageRef.current.onload = () => {
                console.log(`===> IMAGE ${title} LOADED`);
                resolve();
            }
            imageRef.current.onerror = () => {
                const msg: string = `===> FAILED TO LOAD IMAGE ${title}!`;
                console.error(msg);
                reject(new Error(msg));
            };

            imageRef.current.src = imageSrc;
        })
    }

    const loadImages = async () => {

        console.log("===> *** LOADING IMAGES ***", renderCountRef.current++);

        try {
            await Promise.all([
                loadImage(playerImageRef, playerImageSrc, "player"),
                loadImage(backgroundImageRef_1, backgroundImageSrc_1, "bg_1"),
                loadImage(backgroundImageRef_2, backgroundImageSrc_2, "bg_2"),
                loadImage(backgroundImageRef_3, backgroundImageSrc_3, "bg_3"),
                loadImage(backgroundImageRef_4, backgroundImageSrc_4, "bg_4"),
                loadImage(backgroundImageRef_5, backgroundImageSrc_5, "bg_5"),
                loadImage(enemy1ImageRef, enemy1ImageSrc, "en_1"),
                loadImage(enemy2ImageRef, enemy2ImageSrc, "en_2"),
                loadImage(enemy3ImageRef, enemy3ImageSrc, "en_3"),
                loadImage(enemy4ImageRef, enemy4ImageSrc, "en_4"),
            ]);
            console.log("===> ALL BACKGROUND IMAGES LOADED SUCCESSFULLY");
        } catch (error) {
            console.error("===> SOME IMAGES FAILED TO LOAD:", error);
        }
    }

    useEffect(() => {

        console.log("===> *** INIT ***", renderCountRef.current++);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.canvas.width = CANVAS_WIDTH;
        ctx.canvas.height = CANVAS_HEIGHT;

        fillDogAnimations();
        fillEnemy1Animations();
        fillEnemy2Animations();
        fillEnemy3Animations();
        fillEnemy4Animations();

        const layer1 = new Layer("1", canvasRef, backgroundImageRef_1, gameSpeed, 0.2)
        const layer2 = new Layer("2", canvasRef, backgroundImageRef_2, gameSpeed, 0.4)
        const layer3 = new Layer("3", canvasRef, backgroundImageRef_3, gameSpeed, 0.6)
        const layer4 = new Layer("4", canvasRef, backgroundImageRef_4, gameSpeed, 0.8)
        const layer5 = new Layer("5", canvasRef, backgroundImageRef_5, gameSpeed, 1.0)
        layersRef.current.push(layer1, layer2, layer3, layer4, layer5);

        // Start animations immediately.
        loadImages()
            .then(value => {
                startAnimation();
                return () => {
                    if (animationIdRef.current) {
                        cancelAnimationFrame(animationIdRef.current);
                    }
                };
            })
    }, []); // Empty dependencies array - invoked just once after page mount.

    // Restart animations after state changed.
    useEffect(() => {
        playerSpritePhaseToShowIdxRef.current = 0;
        frameCounterRef.current = 0;
        startAnimation();
    }, [playerState]);

    useEffect(() => {
        console.log("===> Game speed changed");
        if (layersRef?.current.length > 0) {
            layersRef.current.forEach(layer => layer.changeGameSpeed(gameSpeed));
        } else {
            console.log("===> NO layerRef.current");
        }
    }, [gameSpeed]);

    const changePlayerState = (newState: string) => {
        setPlayerState(newState);
        playerSpritePhaseToShowIdxRef.current = 0; // Reset shown image phase.
    }

    const changeGameSpeed = (newSpeed: number) => {
        console.log("NEW SPEED", newSpeed);
        setGameSpeed(newSpeed);
    }

    return (
        <div id="App">
            <div id="canvas">
                <canvas id={"canvas-elem"} ref={canvasRef}/>
            </div>
            <div id="controls">
                <div id="choose-animations"></div>
                <label htmlFor="animations">Choose Animation:</label>
                <select id="animations" name="animations" defaultValue={"run"}
                        onChange={(e) => changePlayerState(e.target.value)}>
                    <option value="idle">Idle</option>
                    <option value="jump">Jump</option>
                    <option value="fall">Fall</option>
                    <option value="run">Run</option>
                    <option value="dizzy">Dizzy</option>
                    <option value="sit">Sit</option>
                    <option value="roll">Roll</option>
                    <option value="bite">Bite</option>
                    <option value="ko">Get killed</option>
                    <option value="hit">Get hit</option>
                </select>
                <div id="game-speed">
                    <p>Game speed: <span id="game-speed-span">{gameSpeed}</span></p>
                    <input type="range" id="slider" className="slider" value={gameSpeed} min="0" max="40" step="1"
                           onChange={(e) => {
                               changeGameSpeed(Number(e.target.value))
                           }}/>
                </div>
            </div>
        </div>
    )
}

export default App;
