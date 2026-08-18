// Kernel boots with the app — Bison's runtime exists before any screen renders.
import { bisonRuntime } from '@/lib/bison/kernel/bisonRuntime';
bisonRuntime.boot();