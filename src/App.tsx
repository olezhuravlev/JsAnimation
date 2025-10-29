import React, {useCallback, useEffect, useRef, useState} from 'react';
import './App.css';
import {BackgroundLayer} from "./BackgroundLayer";
import {Creature, Factory} from "./Creature";
import {SoundPreloader} from "./SoundPreloader";

// Case 1: The image is in 'public' folder.
const backgroundImageSrc_1 = '/image/png/layer-1.png';
const backgroundImageSrc_2 = '/image/png/layer-2.png';
const backgroundImageSrc_3 = '/image/png/layer-3.png';
const backgroundImageSrc_4 = '/image/png/layer-4.png';
const backgroundImageSrc_5 = '/image/png/layer-5.png';

const creatureDestroySoundSrc_1 = '/media/explosion_dull.flac';
const creatureDestroySoundSrc_2 = '/media/qubodup-crash.ogg';
const creatureDestroySoundSrc_3 = '/media/pop.ogg';
const creatureDestroySoundSrc_4 = '/media/rumble.flac';
const creatureDestroySoundSrc_5 = '/media/crow_caw.wav';

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

    // Alive objects counter.
    const [objectsQuantity, setObjectsQuantity] = useState<number>(0);

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
                for (let i = creaturesRef.current.length - 1; i >= 0; i--) {
                    const creature = creaturesRef.current[i];
                    if (creature.destroyed) {
                        creaturesRef.current.splice(i, 1);
                        continue;
                    }
                    creature.updatePosition().draw();
                }

                setObjectsQuantity(creaturesRef.current.length)
                canvasCtxRef.current.fillText("Objects: " + creaturesRef.current.length , 5, 40);

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

    const handleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        //console.log("===> CLICK!", event);
        if (creatureFactoryRef.current) {

            //console.log("===> BOOM!", event);

            // Получаем позицию и размеры canvas
            const rect = canvasRef.current.getBoundingClientRect();

            // Масштаб canvas (для responsive canvas)
            const scaleX = canvasRef.current.width / rect.width;
            const scaleY = canvasRef.current.height / rect.height;

            // Преобразуем координаты мыши в координаты canvas
            const x = (event.clientX - rect.left) * scaleX;
            const y = (event.clientY - rect.top) * scaleY;

            console.log("===> BOOM!", x, y);

            creaturesRef.current.push(creatureFactoryRef.current
                .createFixed("boom", "run", x, y, 1, 1, 0.5)
                .setAnimationPhasesToLive(1, (creature: Creature) => {
                    creature.playDestroySound();
                })
                .setDestroySoundSrc(creatureDestroySoundSrc_4)
            );
        }
    }, []);

    useEffect(() => {

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
        if (!ctx) return;

        canvasCtxRef.current = ctx;

        canvasCtxRef.current.canvas.width = CANVAS_WIDTH;
        canvasCtxRef.current.canvas.height = CANVAS_HEIGHT;
        canvasCtxRef.current.font = '40px Impact';
        canvasCtxRef.current.fillStyle = '#576d7e';

        creatureFactoryRef.current = new Factory(ctx);

        // Start animations immediately.
        SoundPreloader.preloadSound(creatureDestroySoundSrc_1)
            .then(() => SoundPreloader.preloadSound(creatureDestroySoundSrc_2))
            .then(() => SoundPreloader.preloadSound(creatureDestroySoundSrc_3))
            .then(() => SoundPreloader.preloadSound(creatureDestroySoundSrc_4))
            .then(() => SoundPreloader.preloadSound(creatureDestroySoundSrc_5))
            .then(() => {
                loadBackgroundImages(canvasCtxRef.current)
                    .then(value => {
                        startAnimation();
                        return () => {
                            if (animationIdRef.current) {
                                cancelAnimationFrame(animationIdRef.current);
                            }
                        };
                    })
            });
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
            // creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 400, 300, 400, 100, 3, 3, 5));
            // creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 400, 300, 600, 100, 3, 3, 5));
            // creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 400, 300, 600, 300, 3, 3, 5));
            // creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 400, 300, 600, 500, 3, 3, 5));
            // creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 400, 300, 400, 500, 3, 3, 5));
            // creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 400, 300, 200, 500, 3, 3, 5));
            // creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 400, 300, 200, 100, 3, 3, 5));
            // creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 400, 300, 200, 300, 3, 3, 5));
            const cosFunc: Function = (distortPhase: number) => Math.cos(distortPhase * Math.PI / 180) * 5;
            const sinFunc: Function = (distortPhase: number) => Math.sin(distortPhase * Math.PI / 180) * 5;
            const zeroFunc: Function = () => 0;
            // creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 0, 200, 500, 300, 2, 2, 5, sinFunc, zeroFunc));
            // creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 0, 200, 500, 300, 2, 2, 5, zeroFunc, sinFunc));
            // creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 0, 200, 500, 300, 2, 2, 5, cosFunc, zeroFunc));
            // creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 0, 200, 500, 300, 2, 2, 5, zeroFunc, cosFunc));
            //creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 0, 200, 500, 300, 2, 2, 5, sinFunc, cosFunc));
            //creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 300, 200, 300, 200, 2, 2, 5, zeroFunc, zeroFunc));
            const destroyFunc: Function = (creature: Creature) => {
                console.log("===> *** DESTROYED AT", creature.x, creature.y, creature.width, creature.height);
                creaturesRef.current.push(creatureFactoryRef.current!
                    .createFixed("boom", "run", creature.x, creature.y, 1, 1, 0.5)
                    .setAnimationPhasesToLive(1)
                );
                creature.playDestroySound();
            };

            let destroySound;
            if (enemyType == "enemy1") {
                destroySound = creatureDestroySoundSrc_1;
            } else if (enemyType == "enemy2") {
                destroySound = creatureDestroySoundSrc_2;
            } else if (enemyType == "enemy3") {
                destroySound = creatureDestroySoundSrc_3;
            } else if (enemyType == "enemy4") {
                destroySound = creatureDestroySoundSrc_4;
            } else if (enemyType == "enemy5") {
                destroySound = creatureDestroySoundSrc_5;
            } else {
                destroySound = creatureDestroySoundSrc_4;
            }

            creaturesRef.current.push(creatureFactoryRef.current.create(enemyType, "run", 300, 200, 400, 200, 4, 4, 0.2)
                .setDistortion(sinFunc, cosFunc)
                .setAnimationPhasesToLive(Math.random() * 200 + 10, destroyFunc)
                .setDestroySoundSrc(destroySound)
            );
        }
    }

    const setDestination = (dest_X: number, dest_Y: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
        creaturesRef.current.forEach(creature => creature.setDestination(dest_X, dest_Y).setSpeed(20, 20));
    }

    return (
        <div id="App">
            <div id="canvas">
                <canvas id={"canvas-elem"} ref={canvasRef} onClick={handleClick}/>
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
                    <span id="objects-quantity">{objectsQuantity}</span>
                    <button onClick={addCharacter("player0")}>Player</button>
                    <button onClick={addCharacter("enemy1")}>Enemy 1</button>
                    <button onClick={addCharacter("enemy2")}>Enemy 2</button>
                    <button onClick={addCharacter("enemy3")}>Enemy 3</button>
                    <button onClick={addCharacter("enemy4")}>Enemy 4</button>
                    <button onClick={addCharacter("enemy5")}>Enemy 5</button>
                    <button onClick={addCharacter("boom")}>Boom</button>
                </div>
                <div>
                    <button onClick={setDestination(1000, 300)}>Set destination</button>
                </div>
            </div>
        </div>
    )
}

export default App;
