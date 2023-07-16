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

            const response = await fetch('framedata2');
            const text = await response.text();

            let lat = 51.5;
            let lon = -0.09;
            const imgWidth = 480;
            const imgHeight = 360;
            const step = 12;
            const baseDist = 0.0001
            const metractorDerivative = 1.6;

            const getPixel = (x: number, y: number) => {
                const index = x + y * (imgWidth+1);
                // check if index is within bounds
                if(index < 0 || index > text.length) {
                    throw new Error('${index} is out of bounds');
                }
                if (x < 0 || y < 0 || x >= imgWidth || y >= imgHeight) {
                    throw new Error('${x}, ${y} is out of bounds');
                }
                return text[index];
            };

            for(let j = 0; j < imgHeight; j += step) {
                for(let i = 0; i < imgWidth; i += step) {
                    if(getPixel(i, j) === '1') {
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