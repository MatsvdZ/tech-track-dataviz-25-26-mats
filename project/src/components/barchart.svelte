<script>
	import * as d3 from 'd3';
	import { onMount } from 'svelte';

	const myData = [4, 8, 15, 16, 23, 42];

	onMount(() => {
		console.log('D3 is running after mount!');

		d3.select('#chart')
			.selectAll('rect')
			.data(myData)
			.join('rect')
			.attr('x', (d, i) => i * 30)
			.attr('y', (d) => 100 - d * 2)
			.attr('width', 20)
			.attr('height', (d) => d * 2)
			.attr('fill', 'steelblue');
	});
</script>

<svg id="chart" width="300" height="100"></svg>
