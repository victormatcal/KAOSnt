declare module "node:test" { const test: any; export default test; export const describe: any; export const it: any; }
declare module "node:assert/strict" { const assert: any; export default assert; }
declare module "node:fs" { const fs: any; export default fs; export const readFileSync: any; export const writeFileSync: any; }
declare const require: any;
declare const process: any;
declare const __dirname: string;
