import React, {useEffect, useRef} from 'react';
import {CANVAS_HEIGHT, CANVAS_WIDTH} from "./App";

interface Point {
    x: number;
    y: number;
}

interface TriangleCanvasProps {
    width?: number;
    height?: number;
    points?: Point[];
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
}

export const TriangleCanvas: React.FC<TriangleCanvasProps> = ({
                                                           width = CANVAS_WIDTH,
                                                           height = CANVAS_HEIGHT,
                                                           points = [{x: 200, y: 50}, {x: 100, y: 200}, {
                                                               x: 300,
                                                               y: 200
                                                           }],
                                                           fillColor = '#3498db',
                                                           strokeColor = '#2980b9',
                                                           strokeWidth = 2
                                                       }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Очищаем canvas
        ctx.clearRect(0, 0, width, height);

        // Начинаем путь для треугольника
        ctx.beginPath();

        // Перемещаемся к первой вершине
        ctx.moveTo(points[0].x, points[0].y);

        // Рисуем линии к остальным вершинам
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        // Замыкаем путь (возвращаемся к первой вершине)
        ctx.closePath();

        // Заливаем треугольник
        ctx.fillStyle = fillColor;
        ctx.fill();

        // Рисуем контур
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
    }, [width, height, points, fillColor, strokeColor, strokeWidth]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                border: '1px solid #ccc',
                borderRadius: '4px'
            }}
        />
    );
};

// Альтернативная версия с отдельными координатами
interface SimpleTriangleProps {
    width?: number;
    height?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    x3?: number;
    y3?: number;
    color?: string;
}

export const SimpleTriangle: React.FC<SimpleTriangleProps> = ({
                                                           width = CANVAS_WIDTH,
                                                           height = CANVAS_HEIGHT,
                                                           x1 = 200,
                                                           y1 = 50,
                                                           x2 = 100,
                                                           y2 = 200,
                                                           x3 = 300,
                                                           y3 = 200,
                                                           color = 'blue'
                                                       }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Очищаем canvas
        ctx.clearRect(0, 0, width, height);

        // Рисуем треугольник
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();

        ctx.fillStyle = color;
        ctx.fill();
        ctx.stroke();
    }, [width, height, x1, y1, x2, y2, x3, y3, color]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{border: '1px solid #ccc'}}
            data-testid="triangle-canvas"
        />
    );
};

// Пример использования компонентов
// const App: React.FC = () => {
//     return (
//         <div style={{padding: '20px'}}>
//             <h2>Треугольник на Canvas</h2>
//
//             {/* Простой треугольник */}
//             <TriangleCanvas/>
//
//             {/* Кастомный треугольник */}
//             <TriangleCanvas
//                 width={300}
//                 height={300}
//                 points={[
//                     {x: 150, y: 50},
//                     {x: 50, y: 250},
//                     {x: 250, y: 250}
//                 ]}
//                 fillColor="#e74c3c"
//                 strokeColor="#c0392b"
//                 strokeWidth={3}
//             />
//
//             {/* Равносторонний треугольник */}
//             <TriangleCanvas
//                 points={[
//                     {x: 200, y: 100},
//                     {x: 100, y: 250},
//                     {x: 300, y: 250}
//                 ]}
//                 fillColor="#2ecc71"
//                 strokeColor="#27ae60"
//             />
//
//             {/* Простая версия */}
//             <SimpleTriangle/>
//             <SimpleTriangle
//                 color="red"
//                 x1={150}
//                 y1={100}
//                 x2={50}
//                 y2={250}
//                 x3={250}
//                 y3={2510}
//             />
//         </div>
//     );
// };
//
// export default App;