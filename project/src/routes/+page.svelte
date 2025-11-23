<script>
  import StatCards from '../components/StatCards.svelte';
  import DonutBrandstof from '../components/DonutBrandstof.svelte';
  import LineVerkoopPerJaar from '../components/LineVerkoopPerJaar.svelte';
  import TopElektrischBar from "../components/TopElektrischBar.svelte";

  export let data;


const statistieken = data.statistieken;
const perJaar = data.perJaar;
const brandstofVerdeling = data.brandstofVerdeling;
const verkoopPerJaar = data.verkoopPerJaar;
const topElektrisch = data.topElektrisch ?? [];
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
    <p class="subtitle">
      Laten we eerst even kijken naar hoeveel <span>elektrische voertuigen</span> op dit moment op onze wegen rondrijden.
    </p>
    <StatCards
      totaal={statistieken.totaal}
      elektrisch={statistieken.elektrisch}
      percentage={statistieken.percentage}
    />
  </section>

  <section class="donut-section">
    <div class="donut-text">
      <h2>Verhouding brandstoffen</h2>
      <p>Misschien is het <span>makkelijker</span> om het te zien in vergelijking tot andere soorten brandstof...</p>
      <p>Zie je dat elektrisch rijden nu bijna net zo populair is als <span>diesel</span>?</p>
    </div>

    <div class="donut-chart">
      <DonutBrandstof data={brandstofVerdeling} />
    </div>
  </section>

  <section class="grid-charts">
    <div>
      <h2>Verkoop per jaar</h2>
      <LineVerkoopPerJaar data={verkoopPerJaar} />
    </div>
  </section>

  <section class="bar-chart">
    <h2>Maar voor welke merken worden er dan gekozen?</h2>
    <TopElektrischBar data={topElektrisch} />
  </section>

  <section class="conclusion">
    <h2>Conclusie</h2>

    <p>
      De transitie naar elektrisch rijden is in volle gang. 
      Onze visualisaties laten zien dat elektrische voertuigen 
      steeds meer de wegen van Nederland vullen en
      hoe snel ze groeien. Terwijl fossiele brandstoffen 
      langzaam plaatsmaken voor duurzame energie, 
      wordt duidelijk dat de toekomst van mobiliteit 
      elektrisch is – en dat deze verandering er nu echt
      aankomt.
    </p>
  </section>
</main>