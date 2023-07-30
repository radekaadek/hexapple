<script lang="ts">
	import HexagonMap from '$lib/HexagonMap.svelte';
	import PointMap from '$lib/PointMap.svelte';

	type Mode = 'loading' | 'hexagons' | 'points';
	let mode: Mode = 'loading';
</script>

<svelte:head>
	<title>Hexapple!</title>
</svelte:head>

<main>
	{#if mode === 'loading'}
		<div class="msg">Choose the mode!</div>
		<div class="points">
			<button on:click={() => mode = 'hexagons'}>Hexagons</button>
			<button on:click={() => mode = 'points'}>Points</button>
		</div>
	{:else if mode === 'hexagons'}
		<HexagonMap/>
	{:else if mode === 'points'}
		<PointMap/>
	{/if}
</main>

<style>
	.msg {
		margin-top: 5rem;
		font-size: 3rem;
		text-align: center;
		/* light purple */
		color: #d033e5;
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

	button:hover {
		background-color: #2980b9;
	}
</style>