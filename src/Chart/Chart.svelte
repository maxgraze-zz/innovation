<script lang="ts">
  import { extent } from 'd3-array';
  import { forceSimulation, forceLink, forceManyBody, forceCollide, forceX, forceY} from 'd3-force'
  import { scaleSqrt, scaleSequential } from 'd3-scale';

  import type {Nodes, Links} from '../types'

    export let nodes: Nodes[];
    export let links: Links[];
let forces = []
  const move = (x: number, y: number) => `transform: translate(${x}px, ${y}px)`
//let width, height
let width, height;
// let width = 1200
//   $: height = width
let usedForceNames = []
let centerPosition = [200, 200]

let renderedNodes = []
let membersAccessor = (d: Nodes) => d.members
let innovAccessor = (d: Nodes) => d.innov
let teamAccessor = (d: Nodes) => d.team

let membersExtent = extent(nodes, membersAccessor)
let innovationExtent = extent(nodes, innovAccessor)

let rScale = scaleSqrt()
.domain(membersExtent as [number, number])
.range([0, 100])


let colorScale = scaleSequential(["#edf5ff", "#001d6c"])
.domain(innovationExtent as [number, number])

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

      $: activeForceX = forceX().x(centerPosition[0])
  $: activeForceY = forceY().y(centerPosition[1])
$: activeForceCollide = forceCollide((d: any) => rScale(membersAccessor(d)))
    .iterations(5)
$: activeLink = forceLink(links)    
    .id((d: any) => teamAccessor(d) as number)


$: forces = [
    ["x", activeForceX],
    ["y", activeForceY],
    ['collide', activeForceCollide],
    ['link', activeLink],
    ['charge', forceManyBody()].filter(d => d)
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
// simulation.alpha(1)
// simulation.restart()

</script>


<div class="wrapper" bind:offsetWidth={width} bind:offsetHeight={height}>

    <!-- <figure class="c" bind:clientWidth="{width}"> -->
        <svg width="{width}" height="{height}">
    <!-- <svg width="100%" height="100%"> -->
        {#each nodes as d}
        {console.log(d)}
        <circle x="{d.x}" y="{d.y}" r="{rScale(membersAccessor(d))}"></circle>
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