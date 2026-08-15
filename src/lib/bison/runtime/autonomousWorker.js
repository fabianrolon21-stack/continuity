import { runNextTask } from '../tasks/taskManager';
import { status as resourceStatus } from '../sustainability/resourceSteward';

let timer;
async function cycle() {
  if (document.visibilityState !== 'visible') return;
  const level = resourceStatus().level?.id;
  if (['PAUSE_NONESSENTIAL', 'REDUCED_NETWORK', 'MINIMAL'].includes(level)) return;
  await runNextTask();
}
export function startAutonomousWorker() {
  if (timer || typeof window === 'undefined') return;
  cycle();
  timer = setInterval(cycle, 120000);
}
export function stopAutonomousWorker() { clearInterval(timer); timer = null; }
startAutonomousWorker();