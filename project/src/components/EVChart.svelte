<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    export let data = [];
  
    let container;
  
    onMount(() => {
      if (data.length > 0) drawChart(data);
    });
  
    function drawChart(data) {
      d3.select(container).selectAll("*").remove();
  
      // Alleen unieke jaren — geen dubbele meer
      const years = [...new Set(data.map(d => +d.jaar))];
  
      const margin = { top: 50, right: 120, bottom: 50, left: 70 };
      const width = 800 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;
  
      const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      // X-as met scaleBand → GEEN dubbele jaartallen
      const x = d3.scaleBand()
        .domain(years)
        .range([0, width])
        .padding(0.3);
  
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.elektrisch, d.nietElektrisch)) * 1.1])
        .range([height, 0]);
  
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(
          d3.axisBottom(x)
            .tickFormat(d3.format("d"))
        );
  
      svg.append("g").call(d3.axisLeft(y));
  
      // Titel
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "600")
        .text("📊 Groei elektrische vs niet-elektrische auto's (vanaf 2018)");
  
      // Line generators
      const lineE = d3.line()
        .x(d => x(+d.jaar) + x.bandwidth() / 2)
        .y(d => y(d.elektrisch))
        .curve(d3.curveMonotoneX);
  
      const lineN = d3.line()
        .x(d => x(+d.jaar) + x.bandwidth() / 2)
        .y(d => y(d.nietElektrisch))
        .curve(d3.curveMonotoneX);
  
      const path1 = svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#007aff")
        .attr("stroke-width", 2.5)
        .attr("d", lineE);
  
      const path2 = svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-width", 2)
        .attr("d", lineN);
  
      // Animation
      [path1, path2].forEach(path => {
        const length = path.node().getTotalLength();
        path
          .attr("stroke-dasharray", `${length} ${length}`)
          .attr("stroke-dashoffset", length)
          .transition()
          .duration(2000)
          .ease(d3.easeCubic)
          .attr("stroke-dashoffset", 0);
      });
  
      // Tooltip
      const tooltip = d3.select(container)
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.75)")
        .style("color", "white")
        .style("padding", "6px 10px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0);
  
      // Points
      svg.selectAll(".point-elektrisch")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(+d.jaar) + x.bandwidth() / 2)
        .attr("cy", d => y(d.elektrisch))
        .attr("r", 5)
        .attr("fill", "#007aff")
        .on("mouseover", (event, d) => {
          tooltip
            .style("opacity", 1)
            .html(`<strong>${d.jaar}</strong><br>Elektrisch: ${d.elektrisch}`)
            .style("left", event.pageX + 12 + "px")
            .style("top", event.pageY - 24 + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));
  
      svg.selectAll(".point-niet")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(+d.jaar) + x.bandwidth() / 2)
        .attr("cy", d => y(d.nietElektrisch))
        .attr("r", 5)
        .attr("fill", "#555")
        .on("mouseover", (event, d) => {
          tooltip
            .style("opacity", 1)
            .html(`<strong>${d.jaar}</strong><br>Niet-elektrisch: ${d.nietElektrisch}`)
            .style("left", event.pageX + 12 + "px")
            .style("top", event.pageY - 24 + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));
  
      // Legend
      const legend = svg.append("g")
        .attr("transform", `translate(${width + 10}, 10)`);
  
      legend.append("circle").attr("r", 6).attr("fill", "#007aff");
      legend.append("text").attr("x", 14).attr("y", 4).text("Elektrisch");
  
      legend.append("circle").attr("r", 6).attr("cy", 25).attr("fill", "#555");
      legend.append("text").attr("x", 14).attr("y", 29).text("Niet-elektrisch");
    }
  </script>
  
  <div bind:this={container} class="chart-container"></div>
  
 