import React, {useEffect, useRef} from 'react';
import './App.css';

// Вариант 1: Если изображение в public папке
const playerImageSrc = '/image/png/shadow_dog.png';

// Вариант 2: Если изображение в src папке (нужен импорт)
//import playerImageSrc from './image/png/shadow_dog.png';

export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 600;

const SPRITE_WIDTH = 575;
const SPRITE_HEIGHT = 523;

function App() {

    const canvasRef = useRef<HTMLCanvasElement>(null as unknown as HTMLCanvasElement);
    //const playerImageRef = React.createRef<HTMLCanvasElement>();

    let frameRow = 0;
    let frameColumn = 0;
    let frameCounter= 0;
    let frozenFrames = 5;
    const spriteFrames: number[] = [7, 7, 7, 9, 11, 5, 7, 7, 12, 4];

    const animate = (ctx: CanvasRenderingContext2D, playerImage: HTMLImageElement) => {

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        const {sourceX, sourceY, sourceWidth, sourceHeight} ={sourceX: 0, sourceY: 0, sourceWidth: SPRITE_WIDTH, sourceHeight: SPRITE_HEIGHT};
        const {destX, destY, destWidth, destHeight} = {destX: 0, destY: 0, destWidth: SPRITE_WIDTH, destHeight: SPRITE_HEIGHT};

        let frameColumnMaxIdx = spriteFrames[frameRow];

        // Freeze all frames - only each N-frame must be redrawn.
        ++frameCounter;
        if (frameCounter % frozenFrames === 0) {
            frameCounter = 0;
            ++frameColumn;
            if (frameColumn >= frameColumnMaxIdx) {
                frameColumn = 0;
                // if (frameRow > frameRowMaxIdx) {
                //     frameRow = 0;
                // }
            }
        }
        //console.log(`stepX: ${stepX}, stepY: ${stepY}`);
        ctx.drawImage(playerImage, frameColumn * SPRITE_WIDTH, frameRow * SPRITE_HEIGHT, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
        requestAnimationFrame(() => {
            animate(ctx, playerImage);
        });
    }

    useEffect(() => {

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        console.log(ctx);
        ctx.canvas.width = CANVAS_WIDTH;
        ctx.canvas.height = CANVAS_HEIGHT;

        const playerImage = new Image();
        playerImage.src = playerImageSrc;

        playerImage.onload = () => {
            animate(ctx, playerImage);
        }

        // playerImage.onerror = () => {
        //     console.error('Не удалось загрузить изображение');
        //     // Рисуем без изображения
        //     animate(ctx, playerImage);
        // }
    }, []); // Пустой массив зависимостей = выполнить только после монтирования

    return (
        <div className="App">

            <canvas id={"canvas1"} ref={canvasRef}/>

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
