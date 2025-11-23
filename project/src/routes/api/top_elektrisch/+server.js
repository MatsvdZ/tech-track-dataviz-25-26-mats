import { RDW, rdwQuery } from "$lib/server/rdw.js";

export async function GET(event) {
  const data = await rdwQuery(RDW.voertuigen, {
    fetch: event.fetch,
    limit: 10000,
    concurrency: 3
  });

  const elektrisch = data.filter(v => v.brandstof_omschrijving === "Elektriciteit");

  const counts = {};
  elektrisch.forEach(v => {
    const merk = v.merk?.trim() || "Onbekend";
    counts[merk] = (counts[merk] || 0) + 1;
  });

  const top10 = Object.entries(counts)
    .map(([merk, aantal]) => ({ merk, aantal }))
    .sort((a, b) => b.aantal - a.aantal)
    .slice(0, 10);

  return new Response(JSON.stringify(top10));
}