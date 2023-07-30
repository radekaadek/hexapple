<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import { convertToBinary, loadMap } from '$lib/utils';

    let map: any;
    let marker: any;

    let loading = true;

    const videoFrameLength = 3286;
    const fps = 15;
    const timePerFrame = Math.ceil(1000/fps);

    onMount(async () => {
        if(browser) {
            const leaflet = await import('leaflet');
            map = await loadMap();

            const metractorDerivative = 1.6;
            const baseDist = 0.0002;
            let markers: any = [];

            const drawImg = async (pixels: Array<boolean>, imgWidth: number, imgHeight: number, step: number) => {
                let lat = 51.5;
                let lon = -0.09;
                for(let j = 0; j < imgHeight; j += step) {
                    for(let i = 0; i < imgWidth; i += step) {
                        if(pixels[i + j * imgWidth] === false) {
                            marker = leaflet.marker([lat, lon], {
                                icon: leaflet.icon({
                                    iconUrl: 'marker-icon.png',
                                    iconSize: [25, 41],
                                    iconAnchor: [12, 41],
                                    shadowUrl: 'marker-shadow.png',
                                    shadowSize: [41, 41],
                                    shadowAnchor: [12, 41],
                                    popupAnchor: [1, -34]
                                })
                            }).addTo(map);
                            markers.push(marker);
                        }
                        lon += baseDist * step * metractorDerivative;
                    }
                    lon = -0.09;
                    lat -= baseDist * step;
                }
            }

            const removeMarkers = () => {
                markers.forEach((marker: any) => {
                    map.removeLayer(marker);
                });
                markers = [];
            }

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

            const step = 18;
            let timeToWait = 0;
            if (imgObj) {
                context?.drawImage(imgObj as HTMLImageElement, 0, 0, imgW, imgH);
            }
            let convertedPixels: Array<boolean> = convertToBinary(context?.getImageData(0, 0, imgW, imgH)?.data as Uint8ClampedArray);
            drawImg(convertedPixels, imgW, imgH, step);
            loading = false;
            for(let i = 1; i < videoFrameLength + 1; i++) {
                if(timeToWait > 0) {
                    await new Promise(r => setTimeout(r, timeToWait));
                }
                const start = new Date().getTime();
                removeMarkers();
                let imgObj = document.getElementById(`a${i}`);
                if (imgObj) {
                    context?.drawImage(imgObj as HTMLImageElement, 0, 0, imgW, imgH);
                }
                const imgPixels = context?.getImageData(0, 0, imgW, imgH);
                const convertedPixels = convertToBinary(imgPixels?.data as Uint8ClampedArray);
                drawImg(convertedPixels, imgW, imgH, step);
                const end = new Date().getTime();
                timeToWait = timePerFrame - (end - start);
            }
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
    <!-- set id to map -->
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