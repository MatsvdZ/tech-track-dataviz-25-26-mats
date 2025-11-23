<script>
  export let totaal = 0;
  export let elektrisch = 0;
  export let percentage = "0.00";

  // Fallbacks in case someone passes undefined
  const totaalDisplay = totaal ?? 0;
  const elektrischDisplay = elektrisch ?? 0;
  const percentageDisplay = percentage ?? "0.00";
</script>

<div class="grid-stats">
  <div class="card">
    <h3>Totaal voertuigen</h3>
    <p>{totaalDisplay.toLocaleString()}</p>
  </div>
  <div class="card">
    <h3>Elektrische voertuigen</h3>
    <p>{elektrischDisplay.toLocaleString()}</p>
  </div>
  <div class="card">
    <h3>Percentage EV</h3>
    <p>{percentageDisplay}%</p>
  </div>
</div>