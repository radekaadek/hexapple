<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';

    let mapElement: HTMLDivElement;
    let map: any;
    let marker: any;

    onMount(async () => {
        if(browser) {
            const leaflet = await import('leaflet');

            map = leaflet.map(mapElement).setView([51.505, -0.09], 13);

            leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);

            // const textResponse = await fetch('framedata2');
            // const text = await textResponse.text();

            const imgObj = document.getElementById('img');
            const canvas = document.createElement('canvas');
            // set canvas size = image size
            canvas.width = (imgObj as HTMLImageElement)?.width;
            canvas.height = (imgObj as HTMLImageElement)?.height;
            // show canvas
            document.body.appendChild(canvas);
            const context = canvas.getContext('2d');
            const imgW = (imgObj as HTMLImageElement)?.width;
            const imgH = (imgObj as HTMLImageElement)?.height;
            if (imgObj) {
                context?.drawImage(imgObj as HTMLImageElement, 0, 0, imgW, imgH);
            }
            const imgPixels = context?.getImageData(0, 0, imgW, imgH);

            const step = 12;
            let convertedPixels = [];
            if (imgPixels?.data) {
                for (let i = 0; i < imgPixels.data.length; i += 4) {
                    const r = imgPixels.data[i];
                    const g = imgPixels.data[i + 1];
                    const b = imgPixels.data[i + 2];
                    const a = imgPixels.data[i + 3];
                    const y = 0.2989 * r + 0.5870 * g + 0.1140 * b;
                    if (y > 50) {
                        convertedPixels.push(1);
                    } else {
                        convertedPixels.push(0);
                    }
                }
            }
            
            let lat = 51.5;
            let lon = -0.09;

            const imgWidth = 480;
            const imgHeight = 360;

            const baseDist = 0.0001
            const metractorDerivative = 1.6;

            for(let j = 0; j < imgHeight; j += step) {
                for(let i = 0; i < imgWidth; i += step) {
                    if(convertedPixels[i + j * imgWidth] === 0) {
                        marker = leaflet.marker([lat, lon]).addTo(map);
                    }
                    lon += baseDist * step * metractorDerivative;
                }
                lon = -0.09;
                lat -= baseDist * step;

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
    <div bind:this={mapElement}></div>
</main>

<style>
    @import 'leaflet/dist/leaflet.css';
    main div {
        height: 50rem;
    }

</style>