<script>
	import StatCards from '../components/StatCards.svelte';
	import DonutBrandstof from '../components/DonutBrandstof.svelte';
	import LineVerkoopPerJaar from '../components/LineVerkoopPerJaar.svelte';


	export let data;

	const statistieken = data.statistieken;
	const perJaar = data.perJaar;
	const brandstofVerdeling = data.brandstofVerdeling;
	const verkoopPerJaar = data.verkoopPerJaar;
	const evTopMerken = data.evTopMerken ?? [];
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
				Ooit werden onze wegen gedomineerd door benzine en diesel. Maar langzaam verandert
				Nederland, en de rest van de wereld: steeds meer voertuigen stappen over op elektriciteit –
				stil, schoon en krachtig. Mijn datavisualisaties laten zien hoe deze transitie zich in
				Nederland voortzet. Van de eerste stappen tot de snelle groei van elektrische mobiliteit.
				Beleef de reis naar een elektrische toekomst.
			</p>

			<a href="#total-cars" class="cta">Bekijk de visualisaties →</a>
		</div>

		<a href="#total-cars" class="arrow-stack">
			<div class="arrow">⌄</div>
			<div class="arrow">⌄</div>
			<div class="arrow">⌄</div>
		</a>
	</section>

	<section id="total-cars" class="page-section">
		<p class="subtitle">
			Laten we eerst even kijken naar hoeveel <span>elektrische voertuigen</span> op dit moment op onze
			wegen rondrijden.
		</p>
		<StatCards
			totaal={statistieken.totaal}
			elektrisch={statistieken.elektrisch}
			percentage={statistieken.percentage}
		/>
		<a href="#donut-section" class="scroll-down">⌄</a>
	</section>

	<section id="donut-section" class="page-section">
		<div class="donut-text">
			<h2>Verhouding brandstoffen</h2>
			<p>
				Misschien is het <span>makkelijker</span> om het te zien in vergelijking tot andere soorten brandstof...
			</p>
			<p>Zie je dat elektrisch rijden nu bijna net zo populair is als <span>diesel</span>?</p>
		</div>

		<div class="donut-chart">
			<DonutBrandstof data={brandstofVerdeling} />
		</div>
		<a href="#grid-charts" class="scroll-down">⌄</a>
	</section>

	<section id="grid-charts" class="page-section">
		<h2>Hoe ziet die groei eruit?</h2>

		<div class="chart-wrapper">
			<LineVerkoopPerJaar data={verkoopPerJaar} />
		</div>

		<p class="chart-caption">
			De lijnen laten zien hoeveel voertuigen er per jaar bijkomen op de Nederlandse wegen. In deze
			visualisatie kun je de groei van de elektriciteit duidelijk zien. Maar waarom is dit zo?
		</p>
		<p class="chart-caption">
			Deze toename komt door een combinatie van beleid, marktontwikkeling en maatschappelijke trends
			te maken. Zo tussen 2020-2023 heeft Nederland een van de aantrekkelijkste EV-subsidies in
			Europa. Deze subsidies zorgen ervoor dat EV's aanzienlijk goedkoper waren in aanschaf én
			gebruik.
		</p>
		<p class="chart-caption">
			Een andere reden voor deze toename zijn de ambitieuze klimaatdoelen in Nederland. Zo willen we
			zo'n 50% <span>minder</span> CO₂-uitstoot in 2030. Dit gaat ook samen met het feit dat in 2035
			alle nieuwe verkochte auto's emissieloos moeten zijn.
		</p>
		<p class="chart-caption">
			Maar niet alleen de overheid wilt overstappen. Ook de mensen zelf zien steeds meer waarom
			elektrisch rijden misschien wel eens de toekomst kan zijn. De elektrische auto is goedkoper in
			gebruik dan een traditionele verbrandingsmotor. Ze vereisen minder onderhoud, hebben lagere
			'brandstofkosten' en hebben vaak lagere kosten over de totale levensduur van de auto. Ook
			hebben veel zakelijke rijders geprofiteerd van een <span>lage bijtelling</span>.
		</p>
		<a href="#conclusion" class="scroll-down">⌄</a>
	</section>

	<section id="conclusion">
		<h2>Conclusie</h2>

		<p>
			De transitie naar elektrisch rijden is in volle gang. Onze visualisaties laten zien dat
			elektrische voertuigen steeds meer de wegen van Nederland vullen en hoe snel ze groeien.
			Terwijl fossiele brandstoffen langzaam plaatsmaken voor duurzame energie, wordt duidelijk dat
			de toekomst van mobiliteit elektrisch is – en dat deze verandering er nu echt aankomt. De
			flinke toename van elektrische auto’s in Nederland sinds 2020 komt door een sterk stimulerend
			beleid, een snelle verbetering van laadinfrastructuur en technologie, én door economische
			voordelen die EV’s aantrekkelijker maken dan benzine- of dieselauto’s.
		</p>
	</section>
</main>
