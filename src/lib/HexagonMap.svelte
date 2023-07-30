<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
	import { loadMap } from './utils';

    let mapElement: HTMLDivElement;
    let map: any;

    let loading = true;

    const videoFrameLength = 3286;
    const fps = 15;
    const timePerFrame = Math.ceil(1000/fps);

    onMount(async () => {
        if(browser) {
            const leaflet = await import('leaflet');
            const h3 = await import('h3-js');
            map = await loadMap();

            // wait for images to load
            while(!document.getElementById(`a${videoFrameLength}`)) {
                await new Promise(r => setTimeout(r, 200));
            }
            const canvas = document.getElementById('canvas') as HTMLCanvasElement;
            const imgObj = document.getElementById('a1');
            canvas.width = (imgObj as HTMLImageElement)?.width;
            canvas.height = (imgObj as HTMLImageElement)?.height;
            document.body.appendChild(canvas);
            const context = canvas.getContext('2d', { willReadFrequently: true });
            const imgW = (imgObj as HTMLImageElement)?.width;
            const imgH = (imgObj as HTMLImageElement)?.height;

            const step = 11;
            let timeToWait = 0;
            if (imgObj) {
                context?.drawImage(imgObj as HTMLImageElement, 0, 0, imgW, imgH);
            }
            loading = false;
            const pixelData = context?.getImageData(0, 0, imgW, imgH)?.data as Uint8ClampedArray;

            const polygons = [];

            const baseDist = 0.0002;
            const drawImg = async (pixels: Uint8ClampedArray, imgWidth: number, imgHeight: number, step: number) => {
                let lat = 51.5;
                let lon = -0.09;
                for(let j = 0; j < imgHeight; j += step) {
                    for(let i = 0; i < imgWidth; i += step) {
                        // lat lon
                        const idx = h3.latLngToCell(lat, lon, 9);
                        const hex = h3.cellToBoundary(idx);
                        const polygon = leaflet.polygon(hex, { color: 'red' }).addTo(map);
                        polygons.push(polygon);
                        lon += baseDist * step;
                    }
                    lon = -0.09;
                    lat -= baseDist * step;
                }
            }
            drawImg(pixelData, imgW, imgH, step);
        }
    });

    onDestroy(async () => {
        if(map) {
            console.log('Unloading Leaflet map.');
            map.remove();
        }
    });
</script>


<main>
    {#each Array.from({ length: videoFrameLength }, (_, i) => i + 1) as number}
    <img src={`out${number}.png`} alt={`out${number}.png`} id={`a${number}`}/>
    {/each}
    <canvas id="canvas"></canvas>
    {#if loading}
    <p>Downloading and calculating...</p>
    {/if}
    <div id="map"></div>
</main>

<style>
    @import 'leaflet/dist/leaflet.css';
    main div {
        height: 100vh;
    }

    p {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: red;
        font-size: 3rem;
    }

    img {
		/* hide */
		display: none;
	}

	canvas {
		display: none;
	}

</style>