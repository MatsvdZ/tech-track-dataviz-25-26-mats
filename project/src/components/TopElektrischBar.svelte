<script>
    import * as d3 from "d3";
    export let data = [];
  
    let container;
  
    $: if (data.length > 0) draw();
  
    function draw() {
      if (!container) return;
      container.innerHTML = "";
  
      const width = 600;
      const height = 400;
      const margin = { top: 30, right: 20, bottom: 60, left: 120 };
  
      const svg = d3
        .select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
  
      const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, d => d.aantal)])
        .range([margin.left, width - margin.right]);
  
      const y = d3
        .scaleBand()
        .domain(data.map(d => d.merk))
        .range([margin.top, height - margin.bottom])
        .padding(0.2);
  
      svg
        .append("g")
        .attr("transform", `translate(0,${margin.top})`)
        .call(d3.axisTop(x));
  
      svg
        .append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
  
      svg
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", margin.left)
        .attr("y", d => y(d.merk))
        .attr("width", 0)
        .attr("height", y.bandwidth())
        .attr("fill", "#37a0ff")
        .transition()
        .duration(800)
        .attr("width", d => x(d.aantal) - margin.left);
    }
  </script>
  
  <div bind:this={container} class="chart"></div>