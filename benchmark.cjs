const { performance } = require('perf_hooks');

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const mockSupabase = {
  from: (table) => ({
    update: (data) => ({
      eq: async (col, val) => {
        await delay(10); // 10ms network latency
        return { error: null };
      }
    }),
    upsert: async (data) => {
      await delay(10); // 10ms network latency
      return { error: null };
    }
  })
};

const times = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, lap_time_ms: 60000 + i * 1000 }));
const pointsSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

async function runOriginal() {
  const start = performance.now();
  for (let i = 0; i < times.length; i++) {
    const pts = i < pointsSystem.length ? pointsSystem[i] : 0;
    await mockSupabase
      .from('championship_round_times')
      .update({ points: pts })
      .eq('id', times[i].id);
  }
  const end = performance.now();
  return end - start;
}

async function runOptimized() {
  const start = performance.now();
  const updates = times.map((t, i) => ({
    ...t,
    points: i < pointsSystem.length ? pointsSystem[i] : 0
  }));
  await mockSupabase
    .from('championship_round_times')
    .upsert(updates);
  const end = performance.now();
  return end - start;
}

async function runBenchmark() {
  console.log('Running benchmark...');
  const originalTime = await runOriginal();
  console.log(`Original Time (Sequential N+1): ${originalTime.toFixed(2)} ms`);

  const optimizedTime = await runOptimized();
  console.log(`Optimized Time (Bulk Upsert): ${optimizedTime.toFixed(2)} ms`);

  const improvement = ((originalTime - optimizedTime) / originalTime) * 100;
  console.log(`Improvement: ${improvement.toFixed(2)}%`);
}

runBenchmark();
