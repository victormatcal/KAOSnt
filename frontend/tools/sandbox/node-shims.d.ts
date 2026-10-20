declare module "node:test" { const test: any; export default test; }
declare module "node:assert/strict" { const assert: any; export default assert; }
declare module "node:fs" { export const readFileSync: any; export const readdirSync: any; }
declare const __dirname: string;
