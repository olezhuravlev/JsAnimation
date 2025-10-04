import React, {useEffect} from 'react';
import './App.css';
import playerImageSrc2 from './image/png/shadow_dog_2.png';

function App() {

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    //const playerImageRef = React.createRef<HTMLCanvasElement>();

    const CANVAS_WIDTH = 600;
    const CANVAS_HEIGHT = 600;

    let x = 0;

    const animate = (ctx: CanvasRenderingContext2D, playerImage: HTMLImageElement) => {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillRect(100, 50, 100, 100);
        ctx.drawImage(playerImage, 0, 0);
        // requestAnimationFrame(() => {
        //     animate(ctx, playerImage);
        // });
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

        // Вариант 1: Если изображение в public папке
        const playerImageSrc = '/image/png/shadow_dog.png';

        // Вариант 2: Если изображение в src папке (нужен импорт - выше)
        //import playerImageSrc from './image/png/shadow_dog_2.png';
        playerImage.src = playerImageSrc;

        playerImage.onload = () => {
            animate(ctx, playerImage);
        }

        playerImage.onerror = () => {
            console.error('Не удалось загрузить изображение');
            // Рисуем без изображения
            animate(ctx, playerImage);
        }
    }, []); // Пустой массив зависимостей = выполнить только после монтирования

    return (
        <div className="App">
            <canvas id={"canvas1"} ref={canvasRef}/>
        </div>
    );
}

export default App;
