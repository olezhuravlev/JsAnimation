import React, {useEffect, useRef, useState} from 'react';
import './App.css';

// Вариант 1: Если изображение в public папке
const playerImageSrc = '/image/png/shadow_dog.png';

// Вариант 2: Если изображение в src папке (нужен импорт)
//import playerImageSrc from './image/png/shadow_dog.png';

export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 600;

const SPRITE_WIDTH = 575;
const SPRITE_HEIGHT = 523;

const spriteAnimations: { [key: string]: any } = {};

function App() {

    const playerImage = new Image();
    playerImage.src = playerImageSrc;

    const canvasRef = useRef<HTMLCanvasElement>(null as unknown as HTMLCanvasElement);
    const [playerState, setPlayerState] = useState("idle");

    let frameCounter = 0;
    let frozenFrames = 7;
    let spritePhaseToShowIdx = 0;

    const animationStates = [
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
    ]

    const changeState = (newState: string) => {
        setPlayerState(newState);
    }

    // Fill in sprite positions array.
    const fillAnimations = () => {
        animationStates.forEach((state, idx) => {
            let frames = {
                location: [] as { x: number; y: number }[],
            }
            for (let frameIdx = 0; frameIdx < state.framesCount; frameIdx++) {
                let positionX = frameIdx * SPRITE_WIDTH;
                let positionY = idx * SPRITE_HEIGHT;
                frames.location.push({x: positionX, y: positionY});
            }
            spriteAnimations[state.name] = frames;
        })
    }

    const animate = (ctx: CanvasRenderingContext2D, playerImage: HTMLImageElement) => {
        // Freeze all frames - only each N-frame must be redrawn.
        ++frameCounter;
        if (frameCounter % frozenFrames === 0) {
            frameCounter = 0;
            const locationArr: { x: number; y: number }[] = spriteAnimations[playerState].location;
            if (spritePhaseToShowIdx >= locationArr.length - 1) {
                spritePhaseToShowIdx = 0;
            }
            const currentLocation = locationArr[spritePhaseToShowIdx++];
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.drawImage(playerImage, currentLocation.x, currentLocation.y, SPRITE_WIDTH, SPRITE_HEIGHT, 0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
        }

        requestAnimationFrame(() => {
            animate(ctx, playerImage);
        });
    }

    useEffect(() => {

        console.log("===> useEffect[]");

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.canvas.width = CANVAS_WIDTH;
        ctx.canvas.height = CANVAS_HEIGHT;

        playerImage.onload = () => {
            animate(ctx, playerImage);
        }

        fillAnimations();
    }, []); // Пустой массив зависимостей = выполнить только после монтирования

    useEffect(() => {

        console.log("===> useEffect[]");

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.canvas.width = CANVAS_WIDTH;
        ctx.canvas.height = CANVAS_HEIGHT;

        frameCounter = 0;
        spritePhaseToShowIdx = 0;
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        animate(ctx, playerImage);
    }, [playerState]);

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
                    <option value="ko">KO</option>
                    <option value="hit">Get hit</option>
                </select>
            </div>

            {/* Простая версия */}
            {/*<SimpleTriangle/>*/}

            {/*<SimpleTriangle color="red" x1={50} y1={50} x2={150} y2={50} x3={250} y3={250}/>*/}

            {/* Простой треугольник */}
            {/*<TriangleCanvas/>*/}

            {/* Кастомный треугольник */}
            {/*<TriangleCanvas width={300} height={300}*/}
            {/*                points={[{x: 150, y: 50}, {x: 50, y: 250}, {x: 250, y: 250}]}*/}
            {/*                fillColor="#e74c3c"*/}
            {/*                strokeColor="#c0392b"*/}
            {/*                strokeWidth={3}/>*/}

            {/* Равносторонний треугольник */}
            {/*<TriangleCanvas*/}
            {/*    points={[{x: 200, y: 100}, {x: 100, y: 250}, {x: 300, y: 250}]}*/}
            {/*    fillColor="#2ecc71"*/}
            {/*    strokeColor="#000"*/}
            {/*/>*/}
        </div>
    );
}

export default App;
