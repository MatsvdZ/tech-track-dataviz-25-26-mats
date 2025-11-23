// src/routes/api/verkoop_per_jaar/+server.js
const RDW_VOERTUIGEN = 'https://opendata.rdw.nl/resource/m9d7-ebf2.json';
const RDW_BRANDSTOF = 'https://opendata.rdw.nl/resource/8ys7-d773.json';

let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 1000 * 60 * 60;

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fout bij fetch: ${res.status}`);
  return await res.json();
}

export async function GET() {
  try {
    if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
      return new Response(JSON.stringify(cache.data), { headers: { 'Content-Type': 'application/json' } });
    }

    // Voertuigen per jaar vanaf 2020
    const voertuigen = await fetchJSON(
      `${RDW_VOERTUIGEN}?$select=kenteken,datum_eerste_toelating&$where=datum_eerste_toelating >= '20200101'`
    );

    // Elektrisch kentekens
    const elektrischData = await fetchJSON(
      `${RDW_BRANDSTOF}?$select=kenteken&$where=brandstof_omschrijving='Elektriciteit'`
    );
    const elektrischSet = new Set(elektrischData.map(d => d.kenteken));

    // Tel per jaar
    const telling = {};
    voertuigen.forEach(v => {
      const jaar = v.datum_eerste_toelating.substring(0, 4);
      if (!telling[jaar]) telling[jaar] = { Benzine: 0, Elektrisch: 0 };
      if (elektrischSet.has(v.kenteken)) {
        telling[jaar].Elektrisch++;
      } else {
        telling[jaar].Benzine++;
      }
    });

    const resultaat = Object.keys(telling)
      .sort()
      .map(j => ({ jaar: j, ...telling[j] }));

    cache = { data: resultaat, timestamp: Date.now() };
    return new Response(JSON.stringify(resultaat), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('❌ /api/verkoop_per_jaar fout:', err);
    return new Response(JSON.stringify({ error: 'Kon RDW data niet ophalen' }), { status: 500 });
  }
}