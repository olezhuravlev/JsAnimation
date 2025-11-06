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

const sniperRifleShootSound = '/media/explosion_dull.flac';
const assaultRifleShootSound = '/media/qubodup-crash.ogg';
const popSound = '/media/pop.ogg';
const shortGunShootSound = '/media/rumble.flac';
const croakSound = '/media/crow_caw.wav';

const bombExplosionSound = '/media/bomb-explosion.wav';
const desertCamelSound = '/media/desert-camel.mp3';
const frogSound_1 = '/media/frog-1.ogg';
const frogSound_2 = '/media/frog-2.ogg';

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

    // Creatures Canvas.
    const creaturesCanvasRef = useRef<HTMLCanvasElement>(null as unknown as HTMLCanvasElement);

    // Creatures Canvas context.
    const creaturesCanvasCtxRef = useRef<CanvasRenderingContext2D>(null as unknown as CanvasRenderingContext2D);

    // Collision canvas.
    const collisionCanvasRef = useRef<HTMLCanvasElement>(null as unknown as HTMLCanvasElement);

    // Collision Canvas context.
    const collisionCanvasCtxRef = useRef<CanvasRenderingContext2D>(null as unknown as CanvasRenderingContext2D);

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

            if (creaturesCanvasCtxRef.current) {

                //console.log("BG LAYERS", backgroundLayersRef.current.length, "CREATURES", creaturesRef.current.length);

                creaturesCanvasCtxRef.current.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                collisionCanvasCtxRef.current.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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
                creaturesCanvasCtxRef.current.fillText("Objects: " + creaturesRef.current.length, 5, 40);

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
                //console.log(`===> IMAGE ${id} LOADED`);
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
            const rect = creaturesCanvasRef.current.getBoundingClientRect();

            // Масштаб canvas (для responsive canvas)
            const scaleX = creaturesCanvasRef.current.width / rect.width;
            const scaleY = creaturesCanvasRef.current.height / rect.height;

            // Преобразуем координаты мыши в координаты canvas
            const x = (event.clientX - rect.left) * scaleX;
            const y = (event.clientY - rect.top) * scaleY;

            const detectPixelColor = collisionCanvasCtxRef.current.getImageData(x, y, 1, 1);
            const pixelColor = detectPixelColor.data;
            console.log("===> BOOM!", x, y, `RGB(${pixelColor})`);

            creaturesRef.current.push(creatureFactoryRef.current
                .createFixed("boom", "run", x, y, 1, 1, 0.5)
                .setAnimationPhasesToLive(1, (creature: Creature) => {
                    creature.playDestroySound();
                })
                .setDestroySoundSrc(sniperRifleShootSound)
            );

            creaturesRef.current.forEach(creature => {
                if (
                    creature.color.r === pixelColor[0]
                    && creature.color.g === pixelColor[1]
                    && creature.color.b === pixelColor[2]
                ) {
                    creature.destroy()
                }
            })
        }
    }, []);

    useEffect(() => {

        const creaturesCanvas = creaturesCanvasRef.current;
        if (!creaturesCanvas) return;

        const creaturesCtx: CanvasRenderingContext2D | null = creaturesCanvas.getContext('2d');
        if (!creaturesCtx) return;

        const collisionCanvas = collisionCanvasRef.current;
        if (!collisionCanvas) {
            console.log("No collision canvas!");
            return;
        }

        const collisionCtx: CanvasRenderingContext2D | null = collisionCanvas.getContext('2d');
        if (!collisionCtx) {
            console.log("No collision canvas context!");
            return;
        }

        creaturesCanvasCtxRef.current = creaturesCtx;
        creaturesCanvasCtxRef.current.canvas.width = CANVAS_WIDTH;
        creaturesCanvasCtxRef.current.canvas.height = CANVAS_HEIGHT;
        creaturesCanvasCtxRef.current.font = '40px Impact';
        creaturesCanvasCtxRef.current.fillStyle = '#576d7e';

        collisionCanvasCtxRef.current = collisionCtx;
        collisionCanvasCtxRef.current.canvas.width = CANVAS_WIDTH;
        collisionCanvasCtxRef.current.canvas.height = CANVAS_HEIGHT;

        creatureFactoryRef.current = new Factory(creaturesCtx, collisionCtx);

        // Start animations immediately.
        SoundPreloader.preloadSound(sniperRifleShootSound)
            .then(() => SoundPreloader.preloadSound(assaultRifleShootSound))
            .then(() => SoundPreloader.preloadSound(popSound))
            .then(() => SoundPreloader.preloadSound(shortGunShootSound))
            .then(() => SoundPreloader.preloadSound(croakSound))
            .then(() => SoundPreloader.preloadSound(bombExplosionSound))
            .then(() => SoundPreloader.preloadSound(desertCamelSound))
            .then(() => SoundPreloader.preloadSound(frogSound_1))
            .then(() => SoundPreloader.preloadSound(frogSound_2))
            .then(() => {
                loadBackgroundImages(creaturesCanvasCtxRef.current)
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

        //console.log("===> Scroll speed changed");

        if (backgroundLayersRef?.current.length > 0) {
            backgroundLayersRef.current.forEach(layer => layer.changeGameSpeed(scrollSpeed));
        } else {
            //console.log("===> NO backgroundLayersRef?.current");
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
                console.log("===> *** DESTROYED AT", Math.floor(creature.x), Math.floor(creature.y), ", SIZE", Math.floor(creature.width), Math.floor(creature.height));
                creaturesRef.current.push(creatureFactoryRef.current!
                    .createFixed("boom", "run", creature.x, creature.y, 1, 1, 0.5)
                    .setAnimationPhasesToLive(1)
                );
                creature.playDestroySound();
            };

            let destroySound;
            if (enemyType == "enemy1") {
                destroySound = frogSound_1;
            } else if (enemyType == "enemy2") {
                destroySound = frogSound_2;
            } else if (enemyType == "enemy3") {
                destroySound = popSound;
            } else if (enemyType == "enemy4") {
                destroySound = bombExplosionSound;
            } else if (enemyType == "enemy5") {
                destroySound = croakSound;
            } else {
                destroySound = shortGunShootSound;
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
                <canvas id={"canvas-elem"} ref={creaturesCanvasRef} onClick={handleClick}/>
                <canvas id={"collision-canvas-elem"} ref={collisionCanvasRef} onClick={handleClick}/>
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
