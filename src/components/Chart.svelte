<script lang="ts">
	import { extent } from "d3-array";
	import {
		forceSimulation,
		forceLink,
		forceManyBody,
		forceCollide,
		forceX,
		forceY,
	} from "d3-force";
	import { scaleSqrt, scaleSequential } from "d3-scale";

	import type { Nodes, Links } from "../types";

	export let nodes: Nodes[];
	export let links: Links[];

	//let width, height
	let width = 0;
	let height = 0;

	let renderedNodes = [];
	let membersAccessor = (d: Nodes) => d.members;
	let innovAccessor = (d: Nodes) => d.innov;
	let teamAccessor = (d: Nodes) => d.team;

	$: rScale = scaleSqrt()
		.domain(extent(nodes, membersAccessor) as [number, number])
		.range([2, width / 20]);

	$: colorScale = scaleSequential(["#edf5ff", "#001d6c"]).domain(
		extent(nodes, innovAccessor) as [number, number]
	);

	$: simulation = forceSimulation()
		.nodes(nodes)
		.force(
			"link",
			forceLink(links).id((d: Nodes) => d.team)
		)
		.force("charge", forceManyBody())
		.force(
			"collide",
			forceCollide((d: Nodes) => rScale(membersAccessor(d)))
		)
		.force("x", forceX())
		.force("y", forceY())
		.on("tick", () => {
			// This limits the x y coordinates to the visible space
			renderedNodes = [...nodes].map((d) => {
				return {
					...d,
					x: Math.max(-width / 2, Math.min(width / 2, d.x)),
					y: Math.max(-height / 2, Math.min(height / 2, d.y)),
				};
			});
			renderedNodes = [...nodes];
		});
</script>

<div class="wrapper" bind:offsetWidth={width} bind:offsetHeight={height}>
	<!-- <figure class="c" bind:clientWidth="{width}"> -->
	<svg {width} {height}>
		<!-- <svg width="100%" height="100%"> -->
		{#each renderedNodes as d}
			<circle
				cx={d.x}
				cy={d.y}
				r={rScale(membersAccessor(d))}
				stroke="none"
				fill={colorScale(d.innov)}
			/>
		{/each}
	</svg>
</div>

<style>
	.wrapper {
		position: relative;
		max-width: 1060px;
		width: 100%;
		height: 100%;
		margin: 0 auto;
	}
</style>
