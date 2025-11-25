<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	export let data = []; // [{ brandstof: 'Benzine', count: 123 }, ...]

	let chartContainer;

	// Kleine categorieën samenvoegen, hulp van ChatGPT
	function mergeSmallCategories(data, threshold) {
		// Voeg alles onder de drempel samen tot "Overig"
		const total = d3.sum(data, (d) => d.count);
		const large = [];
		let otherCount = 0;

		for (const row of data) {
			const pct = row.count / total;
			if (pct < threshold) {
				otherCount += row.count;
			} else {
				large.push(row);
			}
		}

		if (otherCount > 0) {
			large.push({
				brandstof: 'Overig',
				count: otherCount
			});
		}

		return large;
	}

	onMount(() => {
		if (!data.length) return;

		// Kleine categorieën samenvoegen
		const cleanedData = mergeSmallCategories(data, 0.01); // 1%

		// Percentages opnieuw berekenen
		const total = d3.sum(cleanedData, (d) => d.count);
		const dataset = cleanedData.map((d) => ({
			...d,
			percentage: (d.count / total) * 100
		}));

		const width = 450;
		const height = 400; // extra ruimte voor legenda in het SVG-paneel
		const radius = Math.min(width, height - 120) / 2; // laat marge voor de legenda

		// Bijpassend kleurenpalet, kleuren van ChatGPT
		const palette = [
			'#ce88ff',
			'#9f85ff',
			'#6c5ce7',
			'#7dd3fc',
			'#fbcfe8',
			'#ffd166',
			'#ff8fa3',
			'#8b5cf6',
			'#22d3ee',
			'#fb7185'
		];
		const color = d3.scaleOrdinal(palette);

		const svgRoot = d3
			.select(chartContainer)
			.append('svg')
			.attr('width', width)
			.attr('height', height);

		const svg = svgRoot
			.append('g')
			.attr('transform', `translate(${width / 2}, ${(height / 2) - 20})`);

		const pie = d3
			.pie()
			.value((d) => d.count)
			.sort(null);

		const arc = d3
			.arc()
			.innerRadius(radius * 0.5)
			.outerRadius(radius * 0.9);

		const arcs = svg.selectAll('arc').data(pie(dataset)).enter().append('g');

		// animatie wanneer element in viewport komt, hulp van ChatGPT
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					arcs
						.append('path')
						.attr('fill', (d) => color(d.data.brandstof))
						.attr('stroke', 'rgba(255,255,255,0.15)')
						.attr('stroke-width', 1)
						.transition()
						.duration(1000)
						.attrTween('d', function (d) {
							const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
							return (t) => arc(i(t));
						});

					// labels
					arcs
						.append('text')
						.attr('transform', (d) => `translate(${arc.centroid(d)})`)
						.attr('text-anchor', 'middle')
						.attr('dy', '0.35em')
						.text((d) =>
							d.data.brandstof === 'Overig'
								? ''
								: `${d.data.brandstof}: ${d.data.percentage.toFixed(1)}%`
						)
						.style('font-size', '10px')
						.style('fill', '#fff');

					// Plaats "Overig" buiten de donut met een lijntje naar het juiste segment
					const outerArc = d3.arc().innerRadius(radius * 0.9).outerRadius(radius * 1.0);
					const midAngle = (d) => (d.startAngle + d.endAngle) / 2;

					arcs.each(function (d) {
						if (d.data.brandstof !== 'Overig') return;

						const group = d3.select(this);
						// Houd het label dicht bij de donut zodat het niet buiten de 300x300 svg valt
						const labelRadius = radius * 1.05;
						const pos = outerArc.centroid(d);
						pos[0] = labelRadius * (midAngle(d) < Math.PI ? 1 : -1);

						group
							.append('polyline')
							.attr('points', [arc.centroid(d), outerArc.centroid(d), pos])
							.style('fill', 'none')
							.style('stroke', color(d.data.brandstof))
							.style('stroke-width', 1.5);

						group
							.append('text')
							.attr('transform', `translate(${pos})`)
							.attr('text-anchor', midAngle(d) < Math.PI ? 'start' : 'end')
							.attr('dy', '0.35em')
							.text(`${d.data.brandstof}: ${d.data.percentage.toFixed(1)}%`)
							.style('font-size', '11px')
							.style('fill', '#fff');
					});
				}
			},
			{ threshold: 0.3 }
		);

		observer.observe(chartContainer);

		// legenda in het svg-paneel onder de donut
		const legend = svgRoot
			.append('g')
			// kleine margin-top
			.attr('transform', `translate(${width / 2 - 50}, ${height - 85})`);

		const legendItems = legend.selectAll('g').data(dataset).enter().append('g');

		legendItems.attr('transform', (_, i) => `translate(0, ${i * 22})`);

		legendItems
			.append('rect')
			.attr('width', 14)
			.attr('height', 14)
			.attr('rx', 3)
			.attr('ry', 3)
			.attr('fill', (d) => color(d.brandstof));

		legendItems
			.append('text')
			.attr('x', 20)
			.attr('y', 11)
			.text((d) => `${d.brandstof}: ${d.percentage.toFixed(1)}%`)
			.style('fill', '#fff')
			.style('font-size', '12px')
			.style('font-family', 'Inter, sans-serif');
	});
</script>

<div bind:this={chartContainer} class="donut-brandstof-container"></div>
