function extractImageFromHtml(htmlDesc) {
  if (!htmlDesc) return null;
  const match = htmlDesc.match(/<img[^>]+src="([^">]+)"/i);
  return match ? match[1] : null;
}

function cleanDescription(desc) {
  if (!desc) return '';
  return desc.replace(/<[^>]+>/g, '').trim();
}

async function fetchExternalMotorsportNews() {
  const feeds = [
    { url: 'https://lat.motorsport.com/rss/f1/news/', category: 'Formula 1', source: 'Motorsport.com' },
    { url: 'https://lat.motorsport.com/rss/motogp/news/', category: 'MotoGP', source: 'Motorsport.com' },
    { url: 'https://lat.motorsport.com/rss/indycar/news/', category: 'IndyCar', source: 'Motorsport.com' },
    { url: 'https://lat.motorsport.com/rss/wrc/news/', category: 'WRC', source: 'Motorsport.com' },
    { url: 'https://lat.motorsport.com/rss/wec/news/', category: 'WEC', source: 'Motorsport.com' },
    { url: 'https://lat.motorsport.com/rss/imsa/news/', category: 'IMSA', source: 'Motorsport.com' },
    { url: 'https://racer.com/category/formula-1/feed/', category: 'Formula 1', source: 'Racer.com' }
  ];

  const seenLinks = new Map();

  const fetchPromises = feeds.map(async (feed) => {
    try {
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
      if (!response.ok) {
        console.warn(`No se pudo obtener el feed de ${feed.source} (${feed.category})`);
        return [];
      }
      const data = await response.json();
      if (data.status !== 'ok' || !data.items) return [];

      const feedNews = [];
      for (const item of data.items) {
        const title = item.title;
        const link = item.link;

        // We defer duplicate check to the reduce phase to ensure deterministic order if multiple feeds return the same link
        // Actually, we could just return items and process deduplication after all promises resolve

        const rawDesc = item.description || item.content || '';
        const description = cleanDescription(rawDesc);
        const image_url = item.thumbnail || item.enclosure?.link || extractImageFromHtml(rawDesc) || 'default';

        let pub_date;
        try {
          pub_date = new Date(item.pubDate).toISOString();
        } catch {
          pub_date = new Date().toISOString();
        }

        feedNews.push({ title, link, description: description.substring(0, 300), pub_date, source: feed.source, image_url, category: feed.category });
      }
      return feedNews;
    } catch (err) {
      console.error(`Error procesando feed ${feed.url}:`, err);
      return [];
    }
  });

  const results = await Promise.all(fetchPromises);
  const allNews = [];

  for (const feedNews of results) {
    for (const item of feedNews) {
      if (seenLinks.has(item.link)) continue;
      seenLinks.set(item.link, true);
      allNews.push(item);
    }
  }

  return allNews.sort((a, b) => new Date(b.pub_date) - new Date(a.pub_date));
}

async function runBenchmark() {
  console.log('Running parallel benchmark...');
  const times = [];
  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    await fetchExternalMotorsportNews();
    const end = performance.now();
    times.push(end - start);
  }
  console.log(`Average time: ${(times.reduce((a, b) => a + b) / times.length).toFixed(2)} ms`);
}
runBenchmark();
