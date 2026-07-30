import { fetchExternalMotorsportNews } from './src/services/api.js';

async function runBenchmark() {
  const start = performance.now();
  const news = await fetchExternalMotorsportNews();
  const end = performance.now();
  console.log(`Fetched ${news.length} items in ${(end - start).toFixed(2)} ms`);
}

runBenchmark();
