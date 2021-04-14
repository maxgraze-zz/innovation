<script lang="ts">
	import { csv } from "d3-fetch";
	import { onMount } from "svelte";

	import type { Links, Nodes } from "./types";
	import Chart from "./components/Chart.svelte";
	import ForceWrapper from "./components/ForceWrapper.svelte";
	import Visualization from "./Visualization.svelte";
	//import {capitzalizeName} from './utils.svelte'
	let links: any;
	let nodes: any;
	async function loadLinks(): Promise<Array<Links>> {
		links = await csv("team_edges_ibm.csv", (d: any) => ({
			target: +d.to_team,
			source: +d.from_team,
			value: +d.weight,
		}));
		return links;
	}
	async function loadNodes(): Promise<Array<Nodes>> {
		nodes = await csv("teams_ibm.csv", (d: any) => ({
			team: +d.team,
			members: +d.n_members,
			eff: +d.effeciency_score,
			innov: +d.innovation_score,
		}));
		return nodes;
	}

	onMount(() => {
		loadLinks();
		loadNodes();
	});

	//			<Chart {links} {nodes} />
</script>

<div class="wrapper">
	<div class="header">
		<h1>Team Innovation</h1>
	</div>
	<div id="visual">
		{#if links && nodes}
			<Visualization {links} {nodes} />
		{/if}
	</div>
</div>

<style>
	.wrapper {
		width: 95%;
		height: 100%;
		margin: 0 auto;
		font-family: "Fira code", monospace;
	}
	.header {
		width: 100%;
		margin: 1.5rem 0;
	}
	.header h1 {
		font-family: "Myria";
		font-size: calc(3rem + 7px);
	}
	#visual {
		position: relative;
		width: 100%;
		height: 100vmin;
	}
</style>
