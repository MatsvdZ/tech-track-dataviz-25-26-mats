<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	export let data = []; // [{ brandstof: 'Benzine', count: 123 }, ...]

	let chartContainer;

	// 👉 Kleine categorieën samenvoegen
	function mergeSmallCategories(data, threshold) {
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
				brandstof: "Overig",
				count: otherCount
			});
		}

		return large;
	}

	onMount(() => {
		if (!data.length) return;

		// 👉 1) Kleine categorieën samenvoegen
		const cleanedData = mergeSmallCategories(data, 0.01); // 1%

		// 👉 2) Percentages opnieuw berekenen
		const total = d3.sum(cleanedData, (d) => d.count);
		const dataset = cleanedData.map((d) => ({
			...d,
			percentage: (d.count / total) * 100
		}));

		const width = 300;
		const height = 300;
		const radius = Math.min(width, height) / 2;

		const color = d3.scaleOrdinal(d3.schemeCategory10);

		const svg = d3
			.select(chartContainer)
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.attr('transform', `translate(${width / 2}, ${height / 2})`);

		const pie = d3
			.pie()
			.value((d) => d.count)
			.sort(null);

		const arc = d3
			.arc()
			.innerRadius(radius * 0.5)
			.outerRadius(radius * 0.9);

		const arcs = svg.selectAll('arc').data(pie(dataset)).enter().append('g');

		// 👉 animatie wanneer element in viewport komt
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					arcs
						.append('path')
						.attr('fill', (d) => color(d.data.brandstof))
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
						.text((d) => `${d.data.brandstof}: ${d.data.percentage.toFixed(1)}%`)
						.style('font-size', '10px');
				}
			},
			{ threshold: 0.3 }
		);

		observer.observe(chartContainer);

		// 👉 legenda
		const legend = d3
			.select(chartContainer)
			.append('div')
			.style('display', 'flex')
			.style('flex-direction', 'column')
			.style('margin-top', '10px');

		dataset.forEach((d) => {
			const item = legend
				.append('div')
				.style('display', 'flex')
				.style('align-items', 'center')
				.style('opacity', 0);

			item
				.append('div')
				.style('width', '15px')
				.style('height', '15px')
				.style('margin-right', '5px')
				.style('background-color', color(d.brandstof));

			item.append('div').text(`${d.brandstof}: ${d.percentage.toFixed(1)}%`);

			item.transition().delay(500).duration(1000).style('opacity', 1);
		});
	});
</script>

<div bind:this={chartContainer}></div>

<style>
	div {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>