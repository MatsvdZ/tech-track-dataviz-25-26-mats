export async function load({ fetch }) {
    // Dataset A = voertuigen (basisgegevens)
    const baseA = 'https://opendata.rdw.nl/resource/m9d7-ebf2.json';
    // Dataset B = brandstofinformatie
    const baseB = 'https://opendata.rdw.nl/resource/8ys7-d773.json';
  
    async function q(base, query) {
      const url = `${base}?${query}`;
      const res = await fetch(url);
  
      if (!res.ok) {
        console.error("RDW FOUT:", res.status, await res.text());
        return [];
      }
  
      try {
        return await res.json();
      } catch (e) {
        console.error("JSON parse error", e);
        return [];
      }
    }
  
    // 1. TOTAAL voertuigen (Dataset A)
    const totaalRaw = await q(baseA, `$select=count(kenteken)`);
    const totaal = totaalRaw[0]?.count_kenteken
      ? Number(totaalRaw[0].count_kenteken)
      : 0;
  
    // 2. ELEKTRISCH totaal (Dataset B)
    const elektrischRaw = await q(
      baseB,
      `$select=count(kenteken)&$where=brandstof_omschrijving='Elektriciteit'`
    );
    const elektrisch = elektrischRaw[0]?.count_kenteken
      ? Number(elektrischRaw[0].count_kenteken)
      : 0;
  
    // 3. Brandstofverdeling (Dataset B)
    const brandstofVerdeling = await q(
      baseB,
      `$select=brandstof_omschrijving,count(kenteken)&$group=brandstof_omschrijving`
    );
  
    // 4. Voertuigen per jaar vanaf 2018 (Dataset A)
    const perJaar = await q(
      baseA,
      `$select=substr(datum_eerste_toelating,1,4) as jaar,count(kenteken)` +
      `&$where=substr(datum_eerste_toelating,1,4) >= '2018'` +
      `&$group=jaar&$order=jaar`
    );
  
    // Percentage EV
    const percentage =
      totaal > 0 ? ((elektrisch / totaal) * 100).toFixed(2) : "0.00";
  
    return {
      totaal,
      elektrisch,
      percentage,
      brandstofVerdeling,
      perJaar
    };
  }