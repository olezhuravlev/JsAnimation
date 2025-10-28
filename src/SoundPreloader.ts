export class SoundPreloader {

    private static sounds: Map<string, HTMLAudioElement> = new Map();
    private static loadPromises: Map<string, Promise<HTMLAudioElement>> = new Map();

    static async preloadSound(src: string): Promise<HTMLAudioElement> {

        if (this.sounds.has(src)) {
            return this.sounds.get(src)!;
        }

        if (!this.loadPromises.has(src)) {
            this.loadPromises.set(src, new Promise((resolve, reject) => {
                const audio = new Audio();
                audio.src = src;
                audio.preload = "auto";

                const onLoad = () => {
                    audio.removeEventListener('canplaythrough', onLoad);
                    audio.removeEventListener('error', onError);
                    this.sounds.set(src, audio);
                    resolve(audio);
                };

                const onError = (e: Event) => {
                    audio.removeEventListener('canplaythrough', onLoad);
                    audio.removeEventListener('error', onError);
                    reject(e);
                };

                audio.addEventListener('canplaythrough', onLoad);
                audio.addEventListener('error', onError);

                // Форсируем загрузку
                audio.load();
            }));
        }

        return this.loadPromises.get(src)!;
    }

    static getPreloadedSound(src: string): HTMLAudioElement | null {
        return this.sounds.get(src) || null;
    }
}