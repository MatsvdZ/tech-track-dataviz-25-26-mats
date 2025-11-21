<script>
	import StatCards from '../components/StatCards.svelte';
	import DonutBrandstof from '../components/DonutBrandstof.svelte';
	import BarVoertuigenPerJaar from '../components/BarVoertuigenPerJaar.svelte';

	export let data;
</script>

<main>
  <header>
    <h1>ElectraNed</h1>
    <p>Mats van der Zwan</p>
  </header>

  <section class="hero">
    <div class="hero-left">
      <h1>
        Ik toon de transitie van klassieke
        <span class="accent">fossiele brandstoffen</span> naar
        <span class="accent">elektrisch</span> rijden
      </h1>
  
      <p class="subtitle">
        Ooit werden onze wegen gedomineerd door benzine en diesel. Maar langzaam verandert Nederland,
        en de rest van de wereld: steeds meer voertuigen stappen over op elektriciteit – stil, schoon
        en krachtig. Mijn datavisualisaties laten zien hoe deze transitie zich in Nederland voortzet.
        Van de eerste stappen tot de snelle groei van elektrische mobiliteit. Beleef de reis naar een
        elektrische toekomst.
      </p>
  
      <a href="#total-cars" class="cta">Bekijk de visualisaties →</a>
    </div>
  
    <div class="hero-right">
      <div class="arrow">⌄</div>
      <div class="arrow">⌄</div>
      <div class="arrow">⌄</div>
    </div>
  </section>

  <section id="total-cars">
    <p class="subtitle">Laten we eerst even kijken naar hoeveel <span>elektrische auto’s</span> op dit moment op onze wegen rondrijden. Dit zijn er namelijk al:</p>
    <StatCards totaal={data.totaal} elektrisch={data.elektrisch} percentage={data.percentage} />
  </section>

  <section class="donut-section">
    <div class="donut-text">
      <h2>Verhouding brandstoffen</h2>
      <p>Misschien is het <span>makkelijker</span> om het te zien in vergelijking tot andere soorten brandstof...</p>
      <p>Zie je dat elektrisch rijden nu bijna net zo populair is als <span>diesel</span>?</p>
    </div>
  
    <div class="donut-chart">
      <DonutBrandstof data={data.brandstofVerdeling} />
    </div>
  </section>












	<section class="grid-charts">
		<div>
			<h2>Voertuigen per jaar</h2>
			<BarVoertuigenPerJaar data={data.perJaar} />
		</div>
	</section>
</main>


