<script>
	import { onMount } from "svelte";
	import { zoom, zoomIdentity } from "d3-zoom";
	import { select, selectAll, pointer } from "d3-selection";
	import { drag } from "d3-drag";
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

	export let nodes;
	export let links;
	let membersAccessor = (d) => d.members;
	let innovAccessor = (d) => d.innov;

	$: rScale = scaleSqrt()
		.domain(extent(nodes, membersAccessor))
		.range([2, width / 20]);

	$: colorScale = scaleSequential(["#edf5ff", "#001d6c"]).domain(
		extent(nodes, innovAccessor)
	);

	let canvas;
	let width = 800;
	let height = 600;
	let transform = zoomIdentity;
	let simulation, ctx;

	onMount(() => {
		ctx = canvas.getContext("2d");
		resize();

		simulation = forceSimulation()
			.nodes(nodes)
			.force(
				"link",
				forceLink(links).id((d) => d.team)
			)
			.force("charge", forceManyBody())
			.force(
				"collide",
				forceCollide((d) => rScale(membersAccessor(d)))
			)
			.force("x", forceX())
			.force("y", forceY())

			.on("tick", simulationUpdate);
		// title doesn't work yet
		select(ctx.canvas).on("mousemove", () => {
			const pointer = pointer(ctx.canvas);
			const d = simulation.find(
				transform.invertX(pointer[0]),
				transform.invertY(pointer[1])
			);

			if (d) ctx.canvas.title = d.members;
			else ctx.canvas.title = "";
		});
		select(canvas).call(
			zoom()
				.scaleExtent([1 / 10, 8])
				.on("zoom", zoomed)
		);
	});
	function simulationUpdate() {
		ctx.save();
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.translate(transform.x, transform.y);
		ctx.scale(transform.k, transform.k);
		links.forEach((d) => {
			ctx.beginPath();
			ctx.moveTo(d.source.x, d.source.y);
			ctx.lineTo(d.target.x, d.target.y);
			ctx.globalAlpha = 0.6;
			ctx.strokeStyle = "#999";
			ctx.lineWidth = 0;
			//ctx.stroke();
			ctx.globalAlpha = 1;
		});

		nodes.forEach((d, i) => {
			ctx.beginPath();
			ctx.arc(d.x, d.y, rScale(membersAccessor(d)), 0, 2 * Math.PI);
			ctx.strokeStyle = "#fff";
			ctx.lineWidth = 1.5;
			ctx.stroke();
			ctx.fillStyle = colorScale(innovAccessor(d));
			ctx.fill();
		});
		ctx.restore();
	}
	function zoomed(currentEvent) {
		transform = currentEvent.transform;
		simulationUpdate();
	}
	function resize() {
		({ width, height } = canvas);
	}
</script>

<svelte:window on:resize={resize} />

<div class="container">
	<canvas bind:this={canvas} {width} {height} />
</div>

<style>
	canvas {
		position: absolute;
		z-index: 10;
	}
</style>
