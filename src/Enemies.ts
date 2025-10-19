import {SpriteAnimations, SpriteCoords, StatePhase} from "./App";
import {RefObject} from "react";

export const enemy1Phases: StatePhase[] = [
    {
        name: 'run',
        framesCount: 6,
        width: 293,
        height: 155
    }
];

export const enemy2Phases: StatePhase[] = [
    {
        name: 'run',
        framesCount: 6,
        width: 266,
        height: 188
    }
];

export const enemy3Phases: StatePhase[] = [
    {
        name: 'run',
        framesCount: 6,
        width: 218,
        height: 177
    }
];

export const enemy4Phases: StatePhase[] = [
    {
        name: 'run',
        framesCount: 9,
        width: 219,
        height: 212
    }
];

// Fill in Enemy's sprite positions array.
export const fillEnemySpriteAnimations = (animationStatesRef: RefObject<StatePhase[]>, spriteAnimationsRef: RefObject<SpriteAnimations>) => {
    animationStatesRef.current.forEach((state, idx: number) => {
        let frames = {
            location: [] as SpriteCoords[],
        }
        for (let frameIdx = 0; frameIdx < state.framesCount; frameIdx++) {
            let positionX = frameIdx * animationStatesRef.current[idx].width;
            let positionY = idx * animationStatesRef.current[idx].height;
            frames.location.push({x: positionX, y: positionY, width: animationStatesRef.current[idx].width, height: animationStatesRef.current[idx].height});
        }
        spriteAnimationsRef.current[state.name] = frames;
    })
}

export const loadImage = async (element: HTMLImageElement, path: string) => {
    element.src = path;
}
