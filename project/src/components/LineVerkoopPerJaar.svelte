<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let data = []; 
  // [{ jaar: '2020', Benzine: 1000, Elektrisch: 50 }, ...]

  let chartContainer;

  onMount(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 40, right: 100, bottom: 50, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    d3.select(chartContainer).selectAll('*').remove();

    const svg = d3.select(chartContainer)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const subgroups = ['Benzine','Elektrisch'];

    // X = jaar
    const x = d3.scaleBand()
      .domain(data.map(d => d.jaar))
      .range([0, width])
      .padding(0.1);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Y = aantal voertuigen
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.Benzine, d.Elektrisch)) * 1.1])
      .range([height, 0]);

    svg.append('g')
      .call(d3.axisLeft(y));

    // Kleuren
    const color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(['#1f77b4','#ff7f0e']);

    // Lijnen
    const line = d3.line()
      .x(d => x(d.jaar) + x.bandwidth()/2)
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    subgroups.forEach(key => {
      svg.append('path')
        .datum(data.map(d => ({ jaar: d.jaar, value: d[key] })))
        .attr('fill', 'none')
        .attr('stroke', color(key))
        .attr('stroke-width', 2)
        .attr('d', line);

      // Circles voor punten
      svg.selectAll(`.dot-${key}`)
        .data(data.map(d => ({ jaar: d.jaar, value: d[key] })))
        .join('circle')
        .attr('class', `dot-${key}`)
        .attr('cx', d => x(d.jaar) + x.bandwidth()/2)
        .attr('cy', d => y(d.value))
        .attr('r', 4)
        .attr('fill', color(key))
        .attr('opacity', 0)
        .transition()
        .duration(1000)
        .attr('opacity', 1);
    });

    // Legenda
    const legend = svg.selectAll('.legend')
      .data(subgroups)
      .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', (d,i) => `translate(${width + 20}, ${i * 25})`);

    legend.append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', d => color(d));

    legend.append('text')
      .attr('x', 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .text(d => d);
  });
</script>

<div bind:this={chartContainer}></div>