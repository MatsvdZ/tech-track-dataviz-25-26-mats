<script>
	import { onMount, onDestroy } from 'svelte';
	import * as d3 from 'd3';

	export let data = [];

	let chartContainer;
	let resizeObserver;

	function drawChart() {
		// Sla tekenen over als er geen data of container is
		if (!data || data.length === 0) return;
		if (!chartContainer) return;

		const containerWidth = chartContainer.clientWidth;
		const containerHeight = chartContainer.clientHeight || 400;

		// Maak de container eerst leeg
		d3.select(chartContainer).selectAll('*').remove();

		const margin = { top: 20, right: 100, bottom: 20, left: 60 };
		const width = containerWidth - margin.left - margin.right;
		const height = containerHeight - margin.top - margin.bottom;

		const svg = d3
			.select(chartContainer)
			.append('svg')
			.attr('width', containerWidth)
			.attr('height', containerHeight)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		const subgroups = ['Benzine', 'Elektrisch'];

		// X scale
		const x = d3
			.scaleBand()
			.domain(data.map((d) => d.jaar))
			.range([0, width])
			.padding(0.2);

		svg
			.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x))
			.style('color', 'white')
			.selectAll('text')
			.style('font-size', '14px') // ⬅ groter
			.style('font-family', 'inherit')
			.style('font-weight', '500');

		// Y scale
		const y = d3
			.scaleLinear()
			.domain([0, d3.max(data, (d) => Math.max(d.Benzine, d.Elektrisch)) * 1.1])
			.range([height, 0]);

		svg
			.append('g')
			.call(d3.axisLeft(y))
			.style('color', 'white')
			.selectAll('text')
			.style('font-size', '14px') // ⬅ groter
			.style('font-family', 'inherit')
			.style('font-weight', '500');

		// Kleuren (Benzine = wit, Elektrisch = paars)
		const color = d3.scaleOrdinal().domain(subgroups).range(['#ffffff', 'rgba(206, 136, 255, 1)']);

		// Lijn generator
		const line = d3
			.line()
			.x((d) => x(d.jaar) + x.bandwidth() / 2)
			.y((d) => y(d.value))
			.curve(d3.curveMonotoneX);

		// teken lijnen en punten voor elke brandstofgroep
		subgroups.forEach((key) => {
			svg
				.append('path')
				.datum(data.map((d) => ({ jaar: d.jaar, value: d[key] })))
				.attr('fill', 'none')
				.attr('stroke', color(key))
				.attr('stroke-width', 2)
				.attr('d', line);

			// Punten op de lijn
			svg
				.selectAll(`.dot-${key}`)
				.data(data.map((d) => ({ jaar: d.jaar, value: d[key] })))
				.join('circle')
				.attr('cx', (d) => x(d.jaar) + x.bandwidth() / 2)
				.attr('cy', (d) => y(d.value))
				.attr('r', 4)
				.attr('fill', color(key));
		});

		// Legenda rechtsboven in de chart
		const legend = svg.append('g').attr('transform', `translate(${width - 140}, 10)`);
		subgroups.forEach((key, i) => {
			const row = legend.append('g').attr('transform', `translate(0, ${i * 22})`);
			row.append('circle').attr('r', 6).attr('fill', color(key));
			row
				.append('text')
				.attr('x', 14)
				.attr('y', 4)
				.text(key)
				.style('fill', '#fff')
				.style('font-size', '13px')
				.style('font-family', 'Inter, sans-serif');
		});
	}

	onMount(() => {
		drawChart();

		// Teken opnieuw bij resizen
		resizeObserver = new ResizeObserver(() => {
			drawChart();
		});
		resizeObserver.observe(chartContainer);
	});

	onDestroy(() => {
		if (resizeObserver) resizeObserver.disconnect();
	});
</script>

<div bind:this={chartContainer} class="chart-container"></div>
