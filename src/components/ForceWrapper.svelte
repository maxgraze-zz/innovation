<script>
	import { onMount } from "svelte";
	import { scaleLinear, scaleOrdinal } from "d3-scale";
	import { zoom, zoomIdentity } from "d3-zoom";
	import { schemeCategory10 } from "d3-scale-chromatic";
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
	assign(nodes, links);
	console.log(newD);
	let renderedNodes = [];
	let membersAccessor = (d) => d.members;
	let innovAccessor = (d) => d.innov;
	let teamAccessor = (d) => d.team;

	$: rScale = scaleSqrt()
		.domain(extent(nodes, membersAccessor))
		.range([2, width / 20]);

	$: colorScale = scaleSequential(["#edf5ff", "#001d6c"]).domain(
		extent(nodes, innovAccessor)
	);

	export let graph;
	let canvas;
	let width = 500;
	let height = 600;
	const nodeRadius = 5;
	const padding = { top: 20, right: 40, bottom: 40, left: 25 };
	let transform = zoomIdentity;
	let simulation, context;
	onMount(() => {
		context = canvas.getContext("2d");
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
		// title
		select(context.canvas).on("mousemove", () => {
			const pointer = pointer(context.canvas);
			const d = simulation.find(
				transform.invertX(pointer[0]),
				transform.invertY(pointer[1])
			);

			if (d) context.canvas.title = d.id;
			else context.canvas.title = "";
		});
		select(canvas)
			.call(
				drag()
					.container(canvas)
					.subject(dragsubject)
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended)
			)
			.call(
				zoom()
					.scaleExtent([1 / 10, 8])
					.on("zoom", zoomed)
			);
	});
	function simulationUpdate() {
		context.save();
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		context.translate(transform.x, transform.y);
		context.scale(transform.k, transform.k);
		links.forEach((d) => {
			context.beginPath();
			context.moveTo(d.source.x, d.source.y);
			context.lineTo(d.target.x, d.target.y);
			context.globalAlpha = 0.6;
			context.strokeStyle = "#999";
			context.lineWidth = 0;
			//context.stroke();
			context.globalAlpha = 1;
		});

		nodes.forEach((d, i) => {
			context.beginPath();
			context.arc(d.x, d.y, rScale(membersAccessor(d)), 0, 2 * Math.PI);
			context.strokeStyle = "#fff";
			context.lineWidth = 1.5;
			context.stroke();
			context.fillStyle = colorScale(innovAccessor(d));
			context.fill();
		});
		context.restore();
	}
	function zoomed(currentEvent) {
		transform = currentEvent.transform;
		simulationUpdate();
	}
	// Use the d3-force simulation to locate the node
	function dragsubject(currentEvent) {
		const node = simulation.find(
			transform.invertX(currentEvent.x),
			transform.invertY(currentEvent.y),
			nodeRadius
		);
		if (node) {
			node.x = transform.applyX(node.x);
			node.y = transform.applyY(node.y);
		}
		return node;
	}
	function dragstarted(currentEvent) {
		if (!currentEvent.active) simulation.alphaTarget(0.3).restart();
		currentEvent.subject.fx = transform.invertX(currentEvent.subject.x);
		currentEvent.subject.fy = transform.invertY(currentEvent.subject.y);
	}
	function dragged(currentEvent) {
		currentEvent.subject.fx = transform.invertX(currentEvent.x);
		currentEvent.subject.fy = transform.invertY(currentEvent.y);
	}
	function dragended(currentEvent) {
		if (!currentEvent.active) simulation.alphaTarget(0);
		currentEvent.subject.fx = null;
		currentEvent.subject.fy = null;
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
		float: left;
	}
</style>
