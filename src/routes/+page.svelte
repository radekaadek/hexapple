<script lang="ts">
	import LeafletMap from '$lib/LeafletMap.svelte';
</script>

<main>
	<!-- <img src="out1644.png" alt="out1644.png" id="a1644"> -->
	<!-- each number from 1 to 6572 -->
	{#each Array.from({ length: 438 }, (_, i) => i + 1) as number}
		<img src={`out${number}.png`} alt={`out${number}.png`} id={`a${number}`}/>
	{/each}
	
	<canvas id="canvas"></canvas>
	<LeafletMap/>
</main>

<style>
	img {
		/* hide */
		display: none;
	}
	/* id a1644 is displayed */
	#a100 {
		display: block;
	}
	canvas {
		display: none;
	}
</style>