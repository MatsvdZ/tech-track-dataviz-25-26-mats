<script>
    export let totaal;
    export let elektrisch;
    export let percentage;
  </script>
  
  <div class="grid-stats">
    <div class="card">
      <h3>Totaal voertuigen</h3>
      <p>{totaal.toLocaleString()}</p>
    </div>
  
    <div class="card">
      <h3>Elektrisch</h3>
      <p>{elektrisch.toLocaleString()}</p>
    </div>
  
    <div class="card">
      <h3>Aandeel elektrisch</h3>
      <p>{percentage}%</p>
    </div>
  </div>
  