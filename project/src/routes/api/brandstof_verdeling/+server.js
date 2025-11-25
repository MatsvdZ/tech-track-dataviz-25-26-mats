// src/routes/api/brandstofverdeling/+server.js
const RDW_BRANDSTOF = 'https://opendata.rdw.nl/resource/8ys7-d773.json';

let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 1000 * 60 * 60;

async function fetchJSON(url) {
  // Kleine helper voor fetch + JSON met foutafhandeling
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fout bij fetch: ${res.status}`);
  return await res.json();
}

export async function GET() {
  try {
    // Cache hit? Dan direct serve en skip RDW
    if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
      return new Response(JSON.stringify(cache.data), { headers: { 'Content-Type': 'application/json' } });
    }

    // RDW aggregeert per brandstof
    const data = await fetchJSON(`${RDW_BRANDSTOF}?$select=brandstof_omschrijving,count(kenteken)&$group=brandstof_omschrijving`);

    // Kleine categorieën samenvoegen naar Overig
    const small = ['Alcohol', 'CNG', 'LNG', 'Waterstof', undefined];
    let overigCount = 0;
    const filtered = [];

    data.forEach(d => {
      if (small.includes(d.brandstof_omschrijving)) {
        overigCount += parseInt(d.count_kenteken);
      } else {
        filtered.push({ brandstof: d.brandstof_omschrijving, count: parseInt(d.count_kenteken) });
      }
    });

    if (overigCount > 0) filtered.push({ brandstof: 'Overig', count: overigCount });

    // Bewaar in cache en stuur naar client
    cache = { data: filtered, timestamp: Date.now() };
    return new Response(JSON.stringify(filtered), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('❌ /api/brandstofverdeling fout:', err);
    return new Response(JSON.stringify({ error: 'Kon RDW data niet ophalen' }), { status: 500 });
  }
}
