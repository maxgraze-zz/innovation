<script lang="ts">
  import { range, max, extent } from 'd3-array';
  import { forceSimulation, forceLink, forceManyBody, forceCollide, forceX, forceY} from 'd3-force'
  import { scaleLinear, scaleSqrt, scaleSequential } from 'd3-scale';
import { xlink_attr } from 'svelte/internal';
  import type {Nodes, Links} from '../types'
import Force from './Force.svelte';

    export let nodes: Nodes[];
    export let links: Links[];

  const move = (x: number, y: number) => `transform: translate(${x}px, ${y}px)`
//let width, height

let width = 1200
  $: height = width
  $: console.log(`${height}`)
let renderedNodes = []
let membersAccessor = (d: Nodes) => d.members
let innovAccessor = (d: Nodes) => d.innov

let membersExtent = extent(nodes, membersAccessor)
let innovationExtent = extent(nodes, innovAccessor)

$: rScale = scaleSqrt()
.domain(membersExtent as [number, number])
.range([0, 100])


$: colorScale = scaleSequential(["#edf5ff", "#001d6c"])
.domain(innovationExtent as [number, number])
console.log(colorScale.domain())
$: simulation = forceSimulation()
    .nodes(nodes)
    //   .force("link", forceLink(links).id((d: Nodes) => d.team))
    //   .force("charge", forceManyBody())
    // .force("collide", forceCollide((d: Nodes) => rScale(membersAccessor(d))))
    //   .force("x", forceX())
    //   .force("y", forceY())
      .on('tick', () =>{
          renderedNodes = [...nodes]
      })

$: activeForceX = forceX()
$: activeForceY = forceY()
$: activeForceCollide = forceCollide((d: Nodes) => rScale(membersAccessor(d)))
    .iterations(3)
$: activeLink = forceLink(links)    
    .id((d: Nodes) => d.team)


$: forces = [
    ["x", activeForceX],
    ["y", activeForceY],
    ['collide', activeForceCollide],
    ['link', activeLink],
    ['charge', forceManyBody()]
]

$: console.log(`${forces}`)
console.log(forces)


$: {
     //re-initializes forces when the change 
    forces.forEach(([name, force]) => {
        simulation.force(name, force)
    })
}

//removes old forces
const newForceNames = forces.map(([name]) => name)
let oldFoceNames = usedForceNames.filter(
    force => !newForceNames.includes(force)
)

usedForceNames = newForceNames

// kick our simulation into high gear
simulation.alpha(1)
simulation.restart()

let x = 0;
	let y = 0;

	function yPlusAValue(value) {
		return value + y;
	}

	$: total = yPlusAValue(x);

</script>

<div class="wrapper" bind:offsetWidth={width} bind:offsetHeight={height}>
    <p>All Teams</p>
    Total: {total}
<button on:click={() => x++}>
	Increment X
</button>
    <svg width="100%" height="100%">
        {#each renderedNodes as {x, y}, d}
        <circle style="{move(x,y)}" r="{rScale(membersAccessor(d))}"></circle>
        {/each}
    </svg>
</div>

<style>
     .wrapper {
    position: relative;
    max-width: 1060px;
    margin: 0 auto;
  }
</style>