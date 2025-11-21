<script>
    import * as d3 from 'd3';
  
    // Example data — replace or pass from parent
    export let data = [4, 8, 15, 16, 23, 42];
  
    export let width = 640;
    export let height = 400;
    export let marginTop = 20;
    export let marginRight = 30;
    export let marginBottom = 40;
    export let marginLeft = 50;
  
    // Check if data is valid
    $: hasData = Array.isArray(data) && data.length > 0;
  
    // Define scales
    $: x = hasData
      ? d3.scaleLinear([0, data.length - 1], [marginLeft, width - marginRight])
      : null;
  
    $: y = hasData
      ? d3.scaleLinear(d3.extent(data), [height - marginBottom, marginTop])
      : null;
  
    // Define line generator
    $: line = hasData ? d3.line((d, i) => x(i), y) : null;
  
    let xAxis;
    let yAxis;
  
    // Create axis generators when scales change
    $: if (hasData && x && y) {
      const xAxisGen = d3.axisBottom(x).ticks(data.length - 1);
      const yAxisGen = d3.axisLeft(y).ticks(5);
  
      // Apply them when elements exist
      if (xAxis) d3.select(xAxis).call(xAxisGen);
      if (yAxis) d3.select(yAxis).call(yAxisGen);
    }
  </script>
  
  {#if hasData}
    <svg width={width} height={height}>
      <!-- Line path -->
      <path
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        d={line(data)}
      />
  
      <!-- Data points -->
      <g fill="white" stroke="currentColor" stroke-width="1.5">
        {#each data as d, i}
          <circle key={i} cx={x(i)} cy={y(d)} r="2.5" />
        {/each}
      </g>
  
      <!-- Axes -->
      <g bind:this={xAxis} transform={`translate(0,${height - marginBottom})`} />
      <g bind:this={yAxis} transform={`translate(${marginLeft},0)`} />
    </svg>
  {:else}
    <p>No data available</p>
  {/if}