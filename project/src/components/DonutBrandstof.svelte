<script>
	import * as d3 from 'd3';
	import { onMount } from 'svelte';

	export let data = [];

	let container;
	let observer;

	onMount(() => {
		if (!data || data.length === 0) return;

		// Draw only when visible
		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					drawChart();
					observer.disconnect();
				}
			},
			{ threshold: 0.3 }
		);

		observer.observe(container);
	});

	function drawChart() {
		const width = 350;
		const height = 350;
		const radius = Math.min(width, height) / 2;

		const total = d3.sum(data, (d) => d.count_kenteken);

		d3.select(container).selectAll('*').remove();

		// SVG
		const svg = d3
			.select(container)
			.append('svg')
			.attr('width', width + 200) // space for legend
			.attr('height', height)
			.append('g')
			.attr('transform', `translate(${width / 2}, ${height / 2})`);

		const color = d3.scaleOrdinal(d3.schemeTableau10);

		// Pie generator
		const pie = d3
			.pie()
			.sort(null)
			.value((d) => d.count_kenteken);

		const data_ready = pie(data);

		// Arc generator
		const arc = d3.arc().innerRadius(80).outerRadius(radius);

		// Tooltip
		const tooltip = d3
			.select(container)
			.append('div')
			.style('position', 'absolute')
			.style('background', 'rgba(0,0,0,0.8)')
			.style('padding', '8px 12px')
			.style('color', 'white')
			.style('font-size', '14px')
			.style('border-radius', '6px')
			.style('pointer-events', 'none')
			.style('opacity', 0);

		// Draw arcs with transition
		svg
			.selectAll('path')
			.data(data_ready)
			.enter()
			.append('path')
			.attr('fill', (d) => color(d.data.brandstof_omschrijving))
			.attr('stroke', 'white')
			.style('stroke-width', '2px')
			.transition()
			.duration(900)
			.attrTween('d', function (d) {
				const i = d3.interpolate(d.startAngle, d.endAngle);
				return function (t) {
					d.endAngle = i(t);
					return arc(d);
				};
			});

		// Tooltip interactions
		svg
			.selectAll('path')
			.on('mousemove', function (e, d) {
				tooltip
					.style('opacity', 1)
					.html(
						`
            <strong>${d.data.brandstof_omschrijving}</strong><br>
            ${d.data.count_kenteken.toLocaleString()} voertuigen<br>
            ${((d.data.count_kenteken / total) * 100).toFixed(1)}%
          `
					)
					.style('left', e.pageX + 12 + 'px')
					.style('top', e.pageY - 28 + 'px');
			})
			.on('mouseout', () => tooltip.style('opacity', 0));

		// Legend
		const legend = d3
			.select(container)
			.select('svg')
			.append('g')
			.attr('transform', `translate(${width + 20}, 20)`);

		const legendItem = legend
			.selectAll('.legend-item')
			.data(data_ready)
			.enter()
			.append('g')
			.attr('class', 'legend-item')
			.attr('transform', (_, i) => `translate(0, ${i * 24})`)
			.style('cursor', 'pointer');

		// Legend color box
		legendItem
			.append('rect')
			.attr('width', 14)
			.attr('height', 14)
			.attr('fill', (d) => color(d.data.brandstof_omschrijving));

		// Legend text
		legendItem
			.append('text')
			.attr('x', 24)
			.attr('y', 12)
			.style('font-size', '14px')
			.style('fill', '#d8d6e3') // <---- change legend text color here
			.text(
				(d) =>
					`${d.data.brandstof_omschrijving} (${((d.data.count_kenteken / total) * 100).toFixed(
						1
					)}%)`
			);

		// Legend click to toggle slice visibility
		legendItem.on('click', function (_, d) {
			const opacity = svg
				.selectAll('path')
				.filter((p) => p.data.brandstof_omschrijving === d.data.brandstof_omschrijving)
				.style('opacity');

			const newOpacity = opacity == 1 ? 0.2 : 1;

			svg
				.selectAll('path')
				.filter((p) => p.data.brandstof_omschrijving === d.data.brandstof_omschrijving)
				.transition()
				.duration(300)
				.style('opacity', newOpacity);
		});
	}
</script>

<div bind:this={container} class="donut-container"></div>

<style>
	.donut-container {
		position: relative;
		width: fit-content;
	}

	.donut-container div {
		pointer-events: none;
	}
</style>
