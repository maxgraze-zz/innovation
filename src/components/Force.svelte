<script>
	import { getContext, onMount, onDestroy, afterUpdate, tick } from "svelte";
	import { tweened } from "svelte/motion";
	import { cubicOut } from "svelte/easing";
	import { scaleSqrt, scaleSequential } from "d3-scale";
	import { zoom, zoomIdentity } from "d3-zoom";

	import { extent } from "d3-array";
	import {
		forceSimulation,
		forceLink,
		forceManyBody,
		forceCollide,
		forceX,
		forceY,
	} from "d3-force";

	//import { update } from "./Canvas.svelte";
	export let nodes;
	export let links;
	export let parentWidth = 0;
	export let parentHeight = 0;

	let simulation, ctx;
	let transform = zoomIdentity;

	let renderedNodes = [];
	let membersAccessor = (d) => d.members;
	let innovAccessor = (d) => d.innov;
	let teamAccessor = (d) => d.team;

	$: rScale = scaleSqrt()
		.domain(extent(nodes, membersAccessor))
		.range([2, parentWidth / 20]);

	$: colorScale = scaleSequential(["#edf5ff", "#001d6c"]).domain(
		extent(nodes, innovAccessor)
	);
	let opacity = 0.3;
	let fillColor = "#FFFFFF";
	let strokeColor = "#FFFFFF";
	let strokeWidth = 1;
	const { register, deregister, invalidate } = getContext("canvas");

	function simulationUpdate(ctx) {
		//ctx.save();
		//ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		//ctx.translate(transform.x, transform.y);
		//ctx.scale(transform.k, transform.k);
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

	function draw(ctx) {
		ctx.translate(transform.x, transform.y);
		ctx.scale(transform.k, transform.k);
		if (nodes) {
			nodes.forEach((d) => {
				ctx.fillStyle = colorScale(innovAccessor(d));
				if (strokeColor) ctx.strokeStyle = strokeColor;
				ctx.lineWidth = strokeWidth;
				ctx.beginPath();
				ctx.arc(d.x, d.y, rScale(membersAccessor(d)), 0, 2 * Math.PI); //false
				if (strokeColor) ctx.stroke();
				ctx.fill();
			});

			if (links) {
				links.forEach((d) => {
					ctx.beginPath();
					ctx.moveTo(d.source.x, d.source.y);
					ctx.lineTo(d.target.x, d.target.y);
					ctx.globalAlpha = 0.6;
					ctx.strokeStyle = strokeWidth;
					ctx.lineWidth = 0;
					//ctx.stroke();
				});
			}
		}
	}
	onMount(() => {
		invalidate();
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
			.on("tick", register(draw));
		register(draw);
		return () => {
			deregister(draw);
		};
	});
	afterUpdate(invalidate);
	onDestroy(invalidate);
</script>
