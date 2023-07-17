<script lang="ts">
	import LeafletMap from '$lib/LeafletMap.svelte';
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
	integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
	crossorigin=""/>
	<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
	integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
	crossorigin=""></script>
</svelte:head>

<main>
	<!-- <img src="out1644.png" alt="out1644.png" id="a1644"> -->
	<!-- each number from 1 to 6572 -->
	<LeafletMap/>
</main>

<style>

</style>