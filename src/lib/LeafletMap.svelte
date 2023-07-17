<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';

    let mapElement: HTMLDivElement;
    let map: any;
    let marker: any;

    const videoLength = 876;

    onMount(async () => {
        if(browser) {
            const leaflet = await import('leaflet');

            map = leaflet.map(mapElement).setView([51.47, -0.01], 13);
            leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);

            const metractorDerivative = 1.6;
            const baseDist = 0.0002;
            let markers: any = [];

            const drawImg = (pixels: Array<number>, imgWidth: number, imgHeight: number, step: number) => {
                let lat = 51.5;
                let lon = -0.09;
                for(let j = 0; j < imgHeight; j += step) {
                    for(let i = 0; i < imgWidth; i += step) {
                        if(pixels[i + j * imgWidth] === 0) {
                            marker = leaflet.marker([lat, lon]).addTo(map);
                            markers.push(marker);
                        }
                        lon += baseDist * step * metractorDerivative;
                    }
                    lon = -0.09;
                    lat -= baseDist * step;

                }

            }

            const convertToBinary = (pixels: Uint8ClampedArray) => {
                const convertedPixels = [];

                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    const a = pixels[i + 3];
                    const y = 0.2989 * r + 0.5870 * g + 0.1140 * b;
                    if (y > 50) {
                        convertedPixels.push(1);
                    } else {
                        convertedPixels.push(0);
                    }
                }
                return convertedPixels;
            }

            const removeMarkers = () => {
                markers.forEach((marker: any) => {
                    map.removeLayer(marker);
                });
            }

            // wait for image to load
            while(!document.getElementById(`a${videoLength}`)) {
                await new Promise(r => setTimeout(r, 500));
            }
            const canvas = document.getElementById('canvas') as HTMLCanvasElement;
            const imgObj = document.getElementById('a100');
            const imgWidth = (imgObj as HTMLImageElement)?.width;
            const imgHeight = (imgObj as HTMLImageElement)?.height;
            canvas.width = (imgObj as HTMLImageElement)?.width;
            canvas.height = (imgObj as HTMLImageElement)?.height;
            // show canvas
            document.body.appendChild(canvas);
            // set display to none
            (imgObj as HTMLImageElement).style.display = 'none';
            const context = canvas.getContext('2d');
            const imgW = (imgObj as HTMLImageElement)?.width;
            const imgH = (imgObj as HTMLImageElement)?.height;

            const step = 16;

            for(let i = 1; i < videoLength + 1; i++) {
                const start = new Date().getTime();
                let imgObj = document.getElementById(`a${i}`);
                if (imgObj) {
                    context?.drawImage(imgObj as HTMLImageElement, 0, 0, imgW, imgH);
                }
                const imgPixels = context?.getImageData(0, 0, imgW, imgH);
                const convertedPixels = convertToBinary(imgPixels?.data as Uint8ClampedArray);
                drawImg(convertedPixels, imgWidth, imgHeight, step);
                // wait for 500ms to pass
                const end = new Date().getTime();
                const diff = end - start;
                if(diff < 250) {
                    await new Promise(r => setTimeout(r, 250 - diff));
                }
                removeMarkers();
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
    {#each Array.from({ length: 876 }, (_, i) => i + 1) as number}
    <img src={`out${number}.png`} alt={`out${number}.png`} id={`a${number}`}/>
    {/each}

    <canvas id="canvas"></canvas>
    <div bind:this={mapElement}></div>
</main>

<style>
    @import 'leaflet/dist/leaflet.css';
    main div {
        height: 99vh;
    }

    img {
		/* hide */
		display: none;
	}

	canvas {
		display: none;
	}

</style>