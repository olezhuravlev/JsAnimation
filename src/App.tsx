import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {BackgroundLayer} from "./BackgroundLayer";
import {Creature, Factory} from "./Creature";

// Case 1: The image is in 'public' folder.
const backgroundImageSrc_1 = '/image/png/layer-1.png';
const backgroundImageSrc_2 = '/image/png/layer-2.png';
const backgroundImageSrc_3 = '/image/png/layer-3.png';
const backgroundImageSrc_4 = '/image/png/layer-4.png';
const backgroundImageSrc_5 = '/image/png/layer-5.png';

// Case 2: The image is in 'src' folder (import needed).
// import playerImageSrc from './image/png/shadow_dog.png';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 700;

const FROZEN_FRAMES = 2;
const SCROLL_SPEED_INITIAL = 0;

function App() {

    // Player animation.
    const [playerState, setPlayerState] = useState("run");

    // Game scrolling speed.
    const [scrollSpeed, setScrollSpeed] = useState<number>(SCROLL_SPEED_INITIAL);

    // FPS control time.
    const lastTimestampRef = useRef<number>(0);

    // Counter to drop frozen frames.
    const frameCounterRef = useRef<number>(0);

    // Canvas itself.
    const canvasRef = useRef<HTMLCanvasElement>(null as unknown as HTMLCanvasElement);

    // Canvas context.
    const canvasCtxRef = useRef<CanvasRenderingContext2D>(null as unknown as CanvasRenderingContext2D);

    const creatureFactoryRef = useRef<Factory | null>(null);

    // Used for stopping animation.
    const animationIdRef = useRef<number>(0);

    // Background layers.
    const backgroundLayersRef = useRef<BackgroundLayer[]>([]);

    // All the creatures on the canvas.
    const creaturesRef = useRef<Creature[]>([]);

    const animate = (timestamp: number) => {

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

            if (canvasCtxRef.current) {

                //console.log("BG LAYERS", backgroundLayersRef.current.length, "CREATURES", creaturesRef.current.length);

                canvasCtxRef.current.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

                // Draw the backgrounds.
                backgroundLayersRef.current.forEach(layer => layer.updatePosition().draw())

                // Draw all the creatures.
                creaturesRef.current.forEach(creature => creature.updatePosition().draw());

            } else {
                console.log("NO ctx OR spriteCoordinates");
            }
        }

        animationIdRef.current = requestAnimationFrame(animate);
    }

    const startAnimation = () => {

        console.log("===> START ANIMATION!");

        if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
        }
        animationIdRef.current = requestAnimationFrame(animate);
    }

    const loadBackgroundLayer = (id: string, stepWidth: number, speedModifier: number, imageSrc: string, ctx: CanvasRenderingContext2D): Promise<BackgroundLayer> => {

        return new Promise((resolve, reject) => {

            const element: HTMLImageElement = new Image();
            element.onload = () => {
                console.log(`===> IMAGE ${id} LOADED`);
                resolve(new BackgroundLayer(id, element, stepWidth, speedModifier, ctx));
            }
            element.onerror = () => {
                const msg: string = `===> FAILED TO LOAD IMAGE ${id}!`;
                console.error(msg);
                reject(new Error(msg));
            };

            element.src = imageSrc;
        })
    }

    const loadBackgroundImages = async (ctx: CanvasRenderingContext2D) => {

        try {
            const loadedBackgroundLayers = await Promise.all([
                loadBackgroundLayer("bg_1", scrollSpeed, 0.1, backgroundImageSrc_1, ctx),
                loadBackgroundLayer("bg_2", scrollSpeed, 0.2, backgroundImageSrc_2, ctx),
                loadBackgroundLayer("bg_3", scrollSpeed, 0.3, backgroundImageSrc_3, ctx),
                loadBackgroundLayer("bg_4", scrollSpeed, 0.5, backgroundImageSrc_4, ctx),
                loadBackgroundLayer("bg_5", scrollSpeed, 1.0, backgroundImageSrc_5, ctx),
            ]);
            backgroundLayersRef.current = [...loadedBackgroundLayers];
            console.log("===> ALL BACKGROUND LAYERS LOADED SUCCESSFULLY");
        } catch (error) {
            console.error("===> FAILED TO LOAD BACKGROUND LAYERS:", error);
        }
    }

    useEffect(() => {

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
        if (!ctx) return;

        canvasCtxRef.current = ctx;

        canvasCtxRef.current.canvas.width = CANVAS_WIDTH;
        canvasCtxRef.current.canvas.height = CANVAS_HEIGHT;

        creatureFactoryRef.current = new Factory(ctx);

        // Start animations immediately.
        loadBackgroundImages(canvasCtxRef.current)
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
    // useEffect(() => {
    //     frameCounterRef.current = 0;
    //     startAnimation();
    // }, [playerState]);

    useEffect(() => {
        console.log("===> Scroll speed changed");
        if (backgroundLayersRef?.current.length > 0) {
            backgroundLayersRef.current.forEach(layer => layer.changeGameSpeed(scrollSpeed));
        } else {
            console.log("===> NO layerRef.current");
        }
    }, [scrollSpeed]);

    const changePlayerState = (newState: string) => {
        setPlayerState(newState);
    }

    const changeGameSpeed = (newSpeed: number) => {
        console.log("NEW SPEED", newSpeed);
        setScrollSpeed(newSpeed);
    }

    const addCharacter = (enemyType: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
        console.log("ADDED ENEMY", enemyType);
        if (creatureFactoryRef.current) {
            creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 400, 300, 400, 100, 3, 3, 5));
            creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 400, 300, 600, 100, 3, 3, 5));
            creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 400, 300, 600, 300, 3, 3, 5));
            creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 400, 300, 600, 500, 3, 3, 5));
            creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 400, 300, 400, 500, 3, 3, 5));
            creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 400, 300, 200, 500, 3, 3, 5));
            creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 400, 300, 200, 100, 3, 3, 5));
            creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 400, 300, 200, 300, 3, 3, 5));

        }
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
                    <p>Game speed: <span id="game-speed-span">{scrollSpeed}</span></p>
                    <input type="range" id="slider" className="slider" value={scrollSpeed} min="0" max="40" step="1"
                           onChange={(e) => {
                               changeGameSpeed(Number(e.target.value))
                           }}/>
                </div>
                <div id="creatures">
                    <button onClick={addCharacter("player0")}>Player</button>
                    <button onClick={addCharacter("enemy1")}>Enemy 1</button>
                    <button onClick={addCharacter("enemy2")}>Enemy 2</button>
                    <button onClick={addCharacter("enemy3")}>Enemy 3</button>
                    <button onClick={addCharacter("enemy4")}>Enemy 4</button>
                </div>
            </div>
        </div>
    )
}

export default App;
