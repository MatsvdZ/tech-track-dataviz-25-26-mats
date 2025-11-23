// src/lib/server/rdw.js

export const RDW = {
  voertuigen: 'https://opendata.rdw.nl/resource/m9d7-ebf2.json',
  brandstof: 'https://opendata.rdw.nl/resource/8ys7-d773.json'
};

const cache = {};

export async function rdwQuery(
  baseUrl,
  { limit = 10000, concurrency = 3, fetch }
) {
  if (!fetch) {
    throw new Error("rdwQuery requires 'fetch' to be passed (use event.fetch)");
  }

  if (cache[baseUrl]) return cache[baseUrl];

  let allData = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const batch = [];

    for (let i = 0; i < concurrency; i++) {
      const currentOffset = offset + i * limit;
      const url = `${baseUrl}?$limit=${limit}&$offset=${currentOffset}`;

      batch.push(
        fetch(url)
          .then(async (res) => {
            if (!res.ok) return [];
            try {
              return await res.json();
            } catch {
              return [];
            }
          })
          .catch(() => [])
      );
    }

    const results = await Promise.all(batch);
    const flat = results.flat();
    allData.push(...flat);

    if (flat.length < limit * concurrency) hasMore = false;
    offset += limit * concurrency;

    await new Promise((r) => setTimeout(r, 200));
  }

  cache[baseUrl] = allData;
  return allData;
}