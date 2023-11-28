<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { convertToBinary, loadMap } from '$lib/utils.svelte';
	import type { LeafletKeyboardEvent, Map, Marker, Polygon } from 'leaflet';
	import { convertMp4BlobToImages } from '$lib/utils.svelte';
	import { progressValue } from '$lib/utils.svelte';
	import { icons } from '$lib/utils.svelte';

	let map: Map;
	let marker: Marker;
	export let video: File;
	let loading = true;
	let currentIcon = icons[0];
	let videoFrameLength = 0;
	let polygonOnMap = false;

	const togglePolygon = () => {
		if (polygonOnMap) {
			polygon.remove();
			polygonOnMap = false;
		} else {
			polygon.addTo(map);
			polygonOnMap = true;
		}
	};
	
	let polygon: Polygon;

	const baseLat = 51.5;
	const baseLon = -0.09;
	const fps = 30;
	const timePerFrame = Math.ceil(1000 / fps);
	const step = 10;
	const tajemnica = 1.6;
	const baseDist = 0.002;

	onMount(async () => {
		if (browser) {
			const leaflet = await import('leaflet');
			let markerPlacements: Array<Array<Marker | null>> = [];
			const drawImg = async (
				pixels: Array<boolean>,
				imgWidth: number,
				imgHeight: number,
				step: number
				) => {
				let lat = baseLat;
				let lon = baseLon;
				for (let j = 0; j < imgHeight; j += step) {
					for (let i = 0; i < imgWidth; i += step) {
						if (pixels[i + j * imgWidth] === true) {
							if (!markerPlacements[i][j]) {
								marker = leaflet
									.marker([lat, lon], {
										icon: leaflet.icon({
											iconUrl: currentIcon + '.png',
											iconSize: [25, 41],
											iconAnchor: [12, 41],
											shadowUrl: 'marker-shadow.png',
											shadowSize: [41, 41],
											shadowAnchor: [12, 41],
											popupAnchor: [1, -34]
										})
									})
									.addTo(map);
								markerPlacements[i][j] = marker;
							}
						} else {
							if (markerPlacements[i][j]) {
								map.removeLayer(markerPlacements[i][j] as Marker);
								markerPlacements[i][j] = null;
							}
						}
						lon += baseDist * tajemnica;
					}
					lon = baseLon;
					lat -= baseDist;
				}
			};

			// calcualte video frame length using ffmpeg
			const arrayBuffer = await video.arrayBuffer();
			const uint8Array = new Uint8Array(arrayBuffer);
			const videoExtension = video.name.split('.').pop();
			if (!videoExtension) {
				alert('Video extension not found');
				throw new Error('Video extension not found');
			}
			const convertedBlobs = await convertMp4BlobToImages(uint8Array, videoExtension);
			videoFrameLength = convertedBlobs.length;
			console.log('Video frame length: ' + videoFrameLength)
			// create img elements
			console.log('Creating img elements...');
			for (let i = 1; i < videoFrameLength + 1; i++) {
				const imgElement = document.createElement('img');
				imgElement.src = URL.createObjectURL(convertedBlobs[i - 1]);
				imgElement.id = `a${i}`;
				imgElement.hidden = true;
				document.body.appendChild(imgElement);
			}
			loading = false;
			console.log('Loading Leaflet map...');
			map = await loadMap();

			console.log('Drawing images...');
			// wait for images to load
			for (let i = 1; i < videoFrameLength + 1; i++) {
				while (!document.getElementById(`a${i}`)) {
					await new Promise((r) => setTimeout(r, 200));
				}
			}
			console.log('Images loaded.');
			const canvas = document.getElementById('canvas') as HTMLCanvasElement;
			const imgObj = document.getElementById('a1');
			canvas.width = (imgObj as HTMLImageElement)?.width;
			canvas.height = (imgObj as HTMLImageElement)?.height;
			document.body.appendChild(canvas);
			const context = canvas.getContext('2d', { willReadFrequently: true });
			const imgW = (imgObj as HTMLImageElement)?.width;
			const imgH = (imgObj as HTMLImageElement)?.height;
			// draw a polygon around the drawing area
			polygon = leaflet
				.polygon([
					[baseLat, baseLon],
					[baseLat, baseLon + baseDist * tajemnica * Math.floor(imgW / step)],
					[baseLat - baseDist * Math.floor(imgH / step), baseLon + baseDist * tajemnica * Math.floor(imgW / step)],
					[baseLat - baseDist * Math.floor(imgH / step), baseLon]
				])
				.addTo(map);
			polygonOnMap = true;
			console.log('Creating marker placements...');
			for (let i = 0; i < imgW; i++) {
				markerPlacements.push([]);
				for (let j = 0; j < imgH; j++) {
					markerPlacements[i].push(null);
				}
			}
			console.log('Drawing first image...');
			let timeToWait = 0;
			if (imgObj) {
				context?.drawImage(imgObj as HTMLImageElement, 0, 0, imgW, imgH);
			}
			let convertedPixels: Array<boolean> = convertToBinary(
				context?.getImageData(0, 0, imgW, imgH)?.data as Uint8ClampedArray
			);
			console.log('Drawing first image...');
			drawImg(convertedPixels, imgW, imgH, step);
			loading = false;
			console.log('Drawing remaining images...');
			for (let i = 1; i < videoFrameLength + 1; i++) {
				if (timeToWait > 0) {
					await new Promise((r) => setTimeout(r, timeToWait));
				}
				const start = performance.now();
				// removeMarkers();
				let imgObj = document.getElementById(`a${i}`);
				if (imgObj) {
					context?.drawImage(imgObj as HTMLImageElement, 0, 0, imgW, imgH);
				}
				const imgPixels = context?.getImageData(0, 0, imgW, imgH);
				const convertedPixels = convertToBinary(imgPixels?.data as Uint8ClampedArray);
				drawImg(convertedPixels, imgW, imgH, step);
				const end = performance.now();
				timeToWait = timePerFrame - (end - start);
			}
			alert('Done!');
			const emptyPixels = new Array<boolean>(imgW * imgH).fill(false);
			drawImg(emptyPixels, imgW, imgH, step);
			polygon.remove();
			window.location.reload();
		}
	});

	onDestroy(async () => {
		if (map) {
			console.log('Unloading Leaflet map.');
			map.remove();
		}
	});
</script>

<main>
	<canvas id="canvas" />
	{#if loading}
		<div class="maincnt">
			<p>Calculating...</p>
			<p />
		</div>
		<div class="progress">
			<div class="progress-bar-red" style="--progress: {$progressValue * 100}%" />
		</div>
	{:else}
		<!-- popdown menu for choosing icons -->
		<div class="dropdown">
			<button class="dropbtn">Choose icon</button>
			<div class="dropdown-content">
				<div class="btns">
					{#each icons as icon}
						<button on:mousedown={() => (currentIcon = icon)}
							><img src={icon + '.png'} alt={icon} class="drop" />
						</button>
					{/each}
				</div>
			</div>
		</div>
		<!-- button for turning on/off the bounding polygon -->
		<div class="polygon">
			<div class="dropPoly">Bounding polygon</div>
			<button on:mousedown={() => (togglePolygon())} class="toggleButton">Toggle</button>
		</div>
	{/if}
	<div id="map" />
</main>

<style>
	@import 'leaflet/dist/leaflet.css';
	main div {
		height: 100vh;
	}

	.maincnt {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: red;
		font-size: 3rem;
	}

	canvas {
		display: none;
	}

	.dropdown {
		position: absolute;
		top: 10vh;
		left: 1vw;
		z-index: 1000;
	}
	.btns {
		/* order them vertically */
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.progress {
		background-color: rgb(229, 233, 235);
		height: 1em;
		position: relative;
		width: 100%;
	}

	.progress-bar-red {
		background-size: 23em 0.25em;
		height: 100%;
		position: relative;
		background-color: #e04542;
		width: var(--progress);
	}

	.polygon {
		/* set 2rem under the dropdown */
		position: absolute;
		top: 40vh;
		left: 1vw;
		z-index: 1000;
		background-color: rgb(229, 233, 235);
		display: flex;
		flex-direction: column;
		height: 5rem;
	}

	.dropPoly {
		font-size: 1rem;
		height: 2rem;
		padding: 0.2rem;
	}

	.toggleButton {
		background-color: #3498db;
		color: white;
		border: none;
		font-size: 2rem;
		cursor: pointer;
		transition: background-color 0.3s;
		padding: 0.5rem;
	}
</style>
