const RDW_VOERTUIGEN = "https://opendata.rdw.nl/resource/m9d7-ebf2.json";
const RDW_BRANDSTOF = "https://opendata.rdw.nl/resource/8ys7-d773.json";

let cache = { data: {}, timestamp: 0 };
const CACHE_TTL = 1000 * 60 * 60; // 1 uur

const FROM_YEAR = 2020;

// Helper fetch
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fout ${res.status}: ${url}`);
  return res.json();
}

// Helper voor RDW pagination
async function fetchAllPaged(baseUrl, limit = 50000) {
  let results = [];
  let offset = 0;

  while (true) {
    const url = `${baseUrl}&$limit=${limit}&$offset=${offset}`;
    const batch = await fetchJSON(url);

    if (batch.length === 0) break;
    results.push(...batch);

    offset += limit;
    if (offset > 2000000) break; // veiligheid
  }

  return results;
}

export async function GET({ url }) {
  try {
    const type = url.searchParams.get("type") || "all";  
    const cacheKey = type;

    // Cache check
    if (cache.data[cacheKey] && Date.now() - cache.timestamp < CACHE_TTL) {
      return new Response(JSON.stringify(cache.data[cacheKey]), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 1️⃣ RDW voertuigen ophalen (2020+)
    const voertuigen = await fetchAllPaged(
      `${RDW_VOERTUIGEN}?$select=kenteken,voertuigsoort,date_extract_y(datum_eerste_toelating_dt) as jaar&$where=date_extract_y(datum_eerste_toelating_dt)>=${FROM_YEAR}`
    );

    // 2️⃣ Alle elektrische kentekens ophalen
    const elektrischData = await fetchAllPaged(
      `${RDW_BRANDSTOF}?$select=kenteken&$where=brandstof_omschrijving='Elektriciteit'`
    );
    const elektrischSet = new Set(elektrischData.map(x => x.kenteken));

    // Filters per type
    const isMotorvoertuig = v => !["Aanhangwagen", "Oplegger"].includes(v.voertuigsoort);
    const isPersonenauto  = v => v.voertuigsoort === "Personenauto";

    const telling = {};

    voertuigen.forEach(v => {
      const jaar = Number(v.jaar);
      if (!jaar || jaar < FROM_YEAR) return;

      // Filteren op type
      if (type === "auto" && !isPersonenauto(v)) return;
      if (type === "all" && !isMotorvoertuig(v)) return;

      if (!telling[jaar]) {
        telling[jaar] = { Benzine: 0, Elektrisch: 0 };
      }

      if (elektrischSet.has(v.kenteken)) {
        telling[jaar].Elektrisch++;
      } else {
        telling[jaar].Benzine++;
      }
    });

    const result = Object.keys(telling)
      .map(y => ({
        jaar: Number(y),
        Benzine: telling[y].Benzine,
        Elektrisch: telling[y].Elektrisch
      }))
      .sort((a, b) => a.jaar - b.jaar);

    // Opslaan in cache per type
    cache.data[cacheKey] = result;
    cache.timestamp = Date.now();

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("❌ /api/verkoop_per_jaar fout:", err);
    return new Response(JSON.stringify({ error: "Kon RDW data niet ophalen" }), { status: 500 });
  }
}