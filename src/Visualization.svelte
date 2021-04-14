<script lang="ts">
	import { scaleLinear, extent } from "d3";
	import Canvas from "./components/Canvas.svelte";
	import Force from "./components/Force.svelte";

	export let nodes = [];
	export let links = [];
	let width = 0;
	let height = 0;
</script>

<div class="visualization-wrapper">
	<div class="draw-wrapper" bind:clientWidth={width} bind:clientHeight={height}>
		<Canvas {width} {height}>
			<Force {nodes} {links} parentWidth={width} parentHeight={height} />
		</Canvas>
	</div>
</div>

<style>
	.visualization-wrapper {
		width: 100%;
		height: 100%;
	}
	.draw-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
</style>
