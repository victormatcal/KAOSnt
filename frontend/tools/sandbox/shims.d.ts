// Only for environments without @types/react (development sandbox). With `npm install` the real types are used.
declare module "react" {
  export type ReactNode = any;
  export type Dispatch<A> = (value: A) => void;
  export type SetStateAction<S> = S | ((prev: S) => S);
  export interface MutableRefObject<T> { current: T }
  export interface RefObject<T> { current: T | null }
  export function useState<S>(initial: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useLayoutEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useRef<T>(initial: T): MutableRefObject<T>;
  export function useRef<T>(initial: T | null): RefObject<T>;
  export function useMemo<T>(f: () => T, deps: readonly any[]): T;
  export function useCallback<T extends (...a: any[]) => any>(f: T, deps: readonly any[]): T;
  export function useContext<T>(c: Context<T>): T;
  export function useId(): string;
  export interface Context<T> { Provider: any; Consumer: any }
  export function createContext<T>(v: T): Context<T>;
  export const Fragment: any;
  export const StrictMode: any;
  const React: any;
  export default React;
}
declare module "react/jsx-runtime" { export const jsx: any; export const jsxs: any; export const Fragment: any; }
declare module "react-dom/client" { export function createRoot(el: any): { render(n: any): void }; }
declare module "react-dom/server" { export function renderToStaticMarkup(n: any): string; }
declare namespace JSX {
  type Element = any;
  interface IntrinsicElements { [k: string]: any }
  interface ElementChildrenAttribute { children: {} }
  interface IntrinsicAttributes { key?: any }
}
