import React, {RefObject, useEffect, useRef, useState} from 'react';
import './App.css';

// Case 1: The image is in 'public' folder.
const playerImageSrc = '/image/png/shadow_dog.png';

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
const SPRITE_WIDTH = 575;
const SPRITE_HEIGHT = 523;

function App() {

    // useState - invokes rerender.
    // Ref - keeps state until the page refreshed. Doesn't invoke rerender.

    // Image row to show.
    const [playerState, setPlayerState] = useState("idle");

    // Canvas itself.
    const canvasRef = useRef<HTMLCanvasElement>(null as unknown as HTMLCanvasElement);

    // FPS control time.
    const lastTimestampRef = useRef<number>(0);

    // Counter to drop frozen frames.
    const frameCounterRef = useRef<number>(0);

    // Source image for all sprites.
    const playerImageRef = useRef<HTMLImageElement>(new Image());

    let speed = 5;
    const backgroundImageRef_1 = useRef<HTMLImageElement>(new Image());
    const backgroundImageRef_2 = useRef<HTMLImageElement>(new Image());
    const backgroundImageRef_3 = useRef<HTMLImageElement>(new Image());
    const backgroundImageRef_4 = useRef<HTMLImageElement>(new Image());
    const backgroundImageRef_5 = useRef<HTMLImageElement>(new Image());

    // Image phases for each sprite sequence.
    interface StatePhase {
        name: string,
        framesCount: number
    }

    const animationStatesRef = useRef<StatePhase[]>([
        {
            name: 'idle',
            framesCount: 7,
        },
        {
            name: 'jump',
            framesCount: 7,
        },
        {
            name: 'fall',
            framesCount: 7,
        },
        {
            name: 'run',
            framesCount: 9,
        },
        {
            name: 'dizzy',
            framesCount: 11,
        },
        {
            name: 'sit',
            framesCount: 5,
        },
        {
            name: 'roll',
            framesCount: 7,
        },
        {
            name: 'bite',
            framesCount: 7,
        },
        {
            name: 'ko',
            framesCount: 12,
        },
        {
            name: 'hit',
            framesCount: 4,
        }
    ]);

    interface SpriteCoords {
        x: number;
        y: number
    }

    const spriteAnimationsRef = useRef<{ [key: string]: { location: SpriteCoords[] } }>({});

    // To show render events.
    const renderCountRef = useRef(0);

    // Index of phase picture to show.
    const spritePhaseToShowIdxRef = useRef(0);

    const animationIdRef = useRef<number>(0);

    // Fill in sprite positions array.
    const fillAnimations = () => {
        animationStatesRef.current.forEach((state, idx) => {
            let frames = {
                location: [] as SpriteCoords[],
            }
            for (let frameIdx = 0; frameIdx < state.framesCount; frameIdx++) {
                let positionX = frameIdx * SPRITE_WIDTH;
                let positionY = idx * SPRITE_HEIGHT;
                frames.location.push({x: positionX, y: positionY});
            }
            spriteAnimationsRef.current[state.name] = frames;
        })
    }

    const animate = (timestamp: number) => {

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const image = playerImageRef.current;

        // Skip the frame if the image not loaded.
        if (!image.complete) {
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

            const currentAnimation = spriteAnimationsRef.current[playerState];
            if (!currentAnimation) {
                animationIdRef.current = requestAnimationFrame(animate);
                return;
            }

            const locationArr: SpriteCoords[] = currentAnimation.location;
            const spriteCoordinates = locationArr[spritePhaseToShowIdxRef.current++];

            if (ctx && spriteCoordinates) {
                ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                ctx.drawImage(image, spriteCoordinates.x, spriteCoordinates.y, SPRITE_WIDTH, SPRITE_HEIGHT, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            }

            if (spritePhaseToShowIdxRef.current >= locationArr.length) {
                spritePhaseToShowIdxRef.current = 0;
            }
        }

        animationIdRef.current = requestAnimationFrame(animate);
    }

    const startAnimation = () => {
        if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
        }
        animationIdRef.current = requestAnimationFrame(animate);
    }

    const loadBackgroundImage = (backgroundImageRef: RefObject<HTMLImageElement>, backgroundImageSrc: string, title: string) : Promise<void> => {

        return new Promise((resolve, reject) => {

            if (!backgroundImageRef.current) {
                reject(new Error(`BACKGROUND IMAGE REF FOR ${title} IN NULL!`));
                return;
            }

            backgroundImageRef.current.onload = () => {
                console.log(`===> BACKGROUND IMAGE ${title} LOADED`);
                resolve();
            }
            backgroundImageRef.current.onerror = () => {
                const msg: string = `===> FAILED TO LOAD BACKGROUND IMAGE ${title}!`;
                console.error(msg);
                reject(new Error(msg));
            };

            backgroundImageRef.current.src = backgroundImageSrc;
        })
    }

    const loadBackgroundImages = async () => {

        console.log("===> *** LOAD IMAGES ***", renderCountRef.current++);

        try {
            await Promise.all([
                loadBackgroundImage(backgroundImageRef_1, backgroundImageSrc_1, "1"),
                loadBackgroundImage(backgroundImageRef_2, backgroundImageSrc_2, "2"),
                loadBackgroundImage(backgroundImageRef_3, backgroundImageSrc_3, "3"),
                loadBackgroundImage(backgroundImageRef_4, backgroundImageSrc_4, "4"),
                loadBackgroundImage(backgroundImageRef_5, backgroundImageSrc_5, "5"),
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

        fillAnimations();

        loadBackgroundImages();

        playerImageRef.current.onload = () => {
            console.log("===> PLAYER IMAGE LOADED");
            startAnimation();
        }

        playerImageRef.current.onerror = () => {
            console.error("===> FAILED TO LOAD PLAYER IMAGE!");
        };

        playerImageRef.current.src = playerImageSrc;

        // Start animations immediately.
        startAnimation();

        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
        };

    }, []); // Empty dependencies array - invoked just once after page mount.

    // Restart animations after state changed.
    useEffect(() => {
        spritePhaseToShowIdxRef.current = 0;
        frameCounterRef.current = 0;
        startAnimation();
    }, [playerState]);

    const changeState = (newState: string) => {
        setPlayerState(newState);
        spritePhaseToShowIdxRef.current = 0; // Reset shown image phase.
    }

    return (
        <div className="App">

            <canvas id={"canvas1"} ref={canvasRef}/>

            <div className="controls">
                <label htmlFor="animations">Choose Animation</label>
                <select id="animations" name="animations" onChange={(e) => changeState(e.target.value)}>
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
            </div>

            {/* Simple version */}
            {/*<SimpleTriangle/>*/}

            {/*<SimpleTriangle color="red" x1={50} y1={50} x2={150} y2={50} x3={250} y3={250}/>*/}

            {/* Simple triangle */}
            {/*<TriangleCanvas/>*/}

            {/* Custom triangle */}
            {/*<TriangleCanvas width={300} height={300}*/}
            {/*                points={[{x: 150, y: 50}, {x: 50, y: 250}, {x: 250, y: 250}]}*/}
            {/*                fillColor="#e74c3c"*/}
            {/*                strokeColor="#c0392b"*/}
            {/*                strokeWidth={3}/>*/}

            {/* Equilateral triangle */}
            {/*<TriangleCanvas*/}
            {/*    points={[{x: 200, y: 100}, {x: 100, y: 250}, {x: 300, y: 250}]}*/}
            {/*    fillColor="#2ecc71"*/}
            {/*    strokeColor="#000"*/}
            {/*/>*/}
        </div>
    );
}

export default App;
