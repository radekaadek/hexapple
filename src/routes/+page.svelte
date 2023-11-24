<script lang="ts">
	import HexagonMap from '$lib/HexagonMap.svelte';
	import PointMap from '$lib/PointMap.svelte';
	import { convertToBinary, loadMap } from '$lib/utils';
	// import ffmpeg from 'ffmpeg.js/ffmpeg-mp4.js';
	// import ffmpeg from 'js-ffmpeg';

	type Mode = 'loading' | 'hexagons' | 'points';
	let mode: Mode = 'loading';
	let files: FileList;
	let video: File;

	$: if (files) {
		video = files[0];
		mode = 'points';
	}
</script>

<svelte:head>
	<title>Hexapple!</title>
</svelte:head>

<main>
	{#if mode === 'loading'}
		<div class="title">Choose the mode!</div>
		<div class="msg">WARNING!! The animation might load for some time but if it's too long try refreshing the page 😊</div>
		<!-- video input -->
		<input type="file" accept="video/*" bind:files>
		<div class="points">
			<button on:click={() => mode = 'points'}>Points</button>
		</div>
	{:else if mode === 'points'}
		<PointMap />
	{/if}
</main>

<style>
	.title {
		padding-top: 5rem;
		font-size: 4rem;
		text-align: center;
		color: #d033e5;
	}
	.msg {
		padding-top: 2rem;
		font-size: 2rem;
		text-align: center;
		color: #e53333;
	}
	.points {
		/* at the center of the screen */
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
	}
	button {
		background-color: #3498db;
		color: white;
		border: none;
		padding: 10px 20px;
		font-size: 3rem;
		cursor: pointer;
		transition: background-color 0.3s;
		margin: 7rem;
	}
	main {
		background-color: rgb(212, 230, 237);
		height: 100vh;
	}

	button:hover {
		background-color: rgb(58, 73, 204);
	}
</style>