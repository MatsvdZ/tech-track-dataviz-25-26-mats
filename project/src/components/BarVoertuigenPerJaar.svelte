<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    export let data = [];
  
    onMount(() => {
      draw();
    });
  
    function draw() {
      d3.select("#barchart").selectAll("*").remove();
  
      const margin = {top: 40, right: 20, bottom: 40, left: 60};
      const width = 700 - margin.left - margin.right;
      const height = 350 - margin.top - margin.bottom;
  
      const svg = d3.select("#barchart")
        .append("svg")
        .attr("width", width+margin.left+margin.right)
        .attr("height", height+margin.top+margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      const x = d3.scaleBand()
        .domain(data.map(d => d.jaar))
        .range([0, width])
        .padding(0.2);
  
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.count_kenteken)])
        .range([height,0]);
  
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
  
      svg.append("g")
        .call(d3.axisLeft(y));
  
      svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class","bar")
        .attr("x", d => x(d.jaar))
        .attr("y", d => y(+d.count_kenteken))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(+d.count_kenteken))
        .attr("fill", "#007aff");
    }
  </script>
  
  <div id="barchart"></div>