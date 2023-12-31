
<script lang="ts" context="module">
    import { FFmpeg } from '@ffmpeg/ffmpeg';
	import { writable } from 'svelte/store';

    export let icons: string[] = [
        'marker-icon',
        'red-marker-icon',
        'black-marker-icon',
        'green-marker-icon'
    ];
    export let progressValue = writable(0);

    export const loadMap = async () => {
        const leaflet = await import('leaflet');
        const mapElement = document.getElementById('map') as HTMLDivElement;
        const map = leaflet.map(mapElement)
        // check if map is loaded
        while(!map) {
            await new Promise(r => setTimeout(r, 200));
        }
        map.setView([51.468, -0.01], 13);
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        return map;
    }

    const pixelstoRec601 = (pixelValues: Uint8ClampedArray) => {
        const values = Array<number>(pixelValues.length / 4);
        for (let i = 0; i < pixelValues.length; i += 4) {
            const r = pixelValues[i];
            const g = pixelValues[i + 1];
            const b = pixelValues[i + 2];
            const a = pixelValues[i + 3];
            const y = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            values[i / 4] = y;
        }
        return values;
    }

    export const convertToBinary = (pixelValues: Uint8ClampedArray) => {
        const values = pixelstoRec601(pixelValues);
        const convertedPixels = Array<boolean>(pixelValues.length / 4);
        for (let i = 0; i < values.length; i++) {
            convertedPixels[i] = values[i] <= 50;
        }
        return convertedPixels;
    }

    export async function toBlobURL(url: string, type: string) {
        const response = await fetch(url);
        const blob = await response.blob();
        return URL.createObjectURL(new Blob([blob], { type }));
    }

    export async function videoBlobToImageBlob(videoFile: Uint8Array, extension: string): Promise<Blob[]> {
        // load ffmpeg
        const ffmpeg = new FFmpeg();
        ffmpeg.on('log', ({ message }) => {
            console.log(message);
        });
        const progressBase = 0.9;
        ffmpeg.on('progress', ({ progress: p }) => {
            progressValue.set(p * progressBase);
        });
        console.log('loading ffmpeg')
        const loaderr = await ffmpeg.load({
            coreURL: await toBlobURL(`https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`ffmpeg-core.wasm`, 'application/wasm')
        });
		if (!loaderr) {
			return []
		}

        console.log('writing file')
        // write the file to the ffmpeg memory
        const writeerr = await ffmpeg.writeFile('video.' + extension, videoFile)
		if (!writeerr) {
			return []
		}
        console.log('executing ffmpeg')
        const returnExtension = 'png'
        // run the ffmpeg command
        const execerr = await ffmpeg.exec([
            '-i', 'video.' + extension,
            '-vf', 'fps=30', '-vf', 'scale=480:360',
            'out%d.' + returnExtension
        ])
		if (execerr !== 0) {
			return []
		}
        // get the number of files that were created 

        // read the files from the ffmpeg memory
        const files: Blob[] = []
        // get the number of files that were created
        let numFiles = 1
        while(true) {
            try {
                await ffmpeg.readFile('out' + numFiles + '.' + returnExtension)
            } catch (e) {
                break
            }
            numFiles++
        }
        numFiles--
		if (numFiles <= 0) {
			return []
		}
        console.log('Number of files: ' + numFiles)
        for (let i = 1; i <= numFiles; i++) {
            const file = await ffmpeg.readFile('out' + i + '.' + returnExtension)
            const blob = new Blob([file], { type: 'image/' + returnExtension })
            files.push(blob)
            // add 10% to the progress bar
            progressValue.set(progressBase + (1 - progressBase) * i / numFiles)
        }
        console.log('done reading files')
        return files
    }
</script>

