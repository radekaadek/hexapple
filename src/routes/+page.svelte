<script lang="ts">
	import PointMap from '$lib/PointMap.svelte';

	type Mode = 'loading' | 'points';
	let mode: Mode = 'loading';
	let files: FileList;
	let video: File;
	let uploadError: string = '';

	$: if (files) {
		video = files[0];
	}

	const start = () => {
		// check if video is valid
		if (!video) {
			uploadError = 'Please upload a video 🤗';
			// change it to '' after 3 seconds
			setTimeout(() => {
				uploadError = '';
			}, 3000);
			return;
		}
		mode = 'points';
	}
</script>

<svelte:head>
	<title>Hexapple!</title>
</svelte:head>

<main>
	{#if mode === 'loading'}
		<div class="title">Upload a video and press Start!</div>
		<div class="msg">WARNING!! The animation might load for some time but if it's too long try refreshing the page 😊</div>
		<!-- <input type="file" accept="video/*" bind:files> -->
		<label for="images" class="drop-container" id="dropcontainer">
			<span class="drop-title">Drop file here</span>
			or
			<input type="file" id="images" accept="video/*" required bind:files>
		</label>
		  
		<div class="points">
			<button on:click={start}>Start</button>
		</div>
		{#if uploadError}
			<div class="msg">{uploadError}</div>
		{/if}
	{:else if mode === 'points'}
		<PointMap {video} />
	{/if}
	<!-- cheeky trick to load icons -->
	<img src="marker-icon.png" alt="" style="display: none;">
	<img src="marker-shadow.png" alt="" style="display: none;">
</main>

<style>
	.title {
		padding-top: 3rem;
		font-size: 3.5rem;
		text-align: center;
		color: #d033e5;
	}
	.msg {
		padding-top: 2rem;
		padding-bottom: 2rem;
		font-size: 2rem;
		text-align: center;
		color: #e53333;
	}
	.points {
		display: flex;
		justify-content: center;
	}
	button {
		background-color: #3498db;
		color: white;
		border: none;
		padding: 10px 4rem;
		font-size: 3rem;
		cursor: pointer;
		transition: background-color 0.3s;
		margin: 7rem;
	}
	main {
		background-color: rgb(212, 230, 237);
		height: 100vh;
	}
	/* set height on mobile */
	@media (max-width: 600px) {
		main {
			height: 100%;
		}
	}

	button:hover {
		background-color: rgb(58, 73, 204);
	}
	.drop-container {
		position: relative;
		display: flex;
		gap: 10px;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100px;
		width: min(300px, 80vw);
		padding: 20px;
		border-radius: 10px;
		border: 2px dashed #555;
		color: #444;
		cursor: pointer;
		transition: background .2s ease-in-out, border .2s ease-in-out;
		margin: 0 auto; /* Add this line */
	}

	.drop-container:hover {
		background: #eee;
		border-color: #111;
	}

	.drop-container:hover .drop-title {
		color: #222;
	}

	.drop-title {
		color: #444;
		font-size: 20px;
		font-weight: bold;
		text-align: center;
		transition: color .2s ease-in-out;
	}
	/* add main padding on mobile */
	@media (max-width: 600px) {
		main {
			padding: 0 1rem;
		}
	}
	input[type="file"] {
		height: 100%;
		width: 100%;
		cursor: pointer;
	}

</style>