/* tslint:disable */
/* eslint-disable */
/**
*/
export function initialize(): void;
/**
* @param {string} message
* @returns {number}
*/
export function sha1_hash(message: string): number;
/**
* @returns {number}
*/
export function generate_params(): number;
/**
* @param {string} message
* @param {string} p
* @param {string} q
* @param {string} g
* @param {string} x
* @returns {number}
*/
export function sign(message: string, p: string, q: string, g: string, x: string): number;
/**
* @param {string} message
* @param {string} r
* @param {string} s
* @param {string} p
* @param {string} q
* @param {string} g
* @param {string} y
* @returns {boolean}
*/
export function verify(message: string, r: string, s: string, p: string, q: string, g: string, y: string): boolean;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly sha1_hash: (a: number, b: number) => number;
  readonly generate_params: () => number;
  readonly sign: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => number;
  readonly verify: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number) => number;
  readonly initialize: () => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
