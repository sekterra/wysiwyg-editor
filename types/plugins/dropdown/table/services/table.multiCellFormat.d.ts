import type {} from '../../../../typedef';
/**
 * @param {SunEditor.Deps} $
 * @returns {HTMLTableCellElement[]|null}
 */
export function getMultiSelectedTableCells($: SunEditor.Deps): HTMLTableCellElement[] | null;
/**
 * @param {SunEditor.Deps} $
 * @param {HTMLTableCellElement} cell
 */
export function selectCellContentsRange($: SunEditor.Deps, cell: HTMLTableCellElement): void;
/**
 * @param {SunEditor.Deps} $
 * @param {string} command Toolbar command (e.g. bold)
 * @returns {boolean} true if multi-cell bulk handled
 */
export function tryBulkFontStyle($: SunEditor.Deps, command: string): boolean;
/**
 * @param {SunEditor.Deps} $
 * @param {(cell: HTMLTableCellElement) => void} fn
 * @returns {boolean}
 */
export function withMultiTableCellsHistory($: SunEditor.Deps, fn: (cell: HTMLTableCellElement) => void): boolean;
/**
 * @param {SunEditor.Deps} $
 * @param {string} value align `data-command`
 * @param {string} defaultDir
 * @returns {boolean}
 */
export function tryBulkTableAlign($: SunEditor.Deps, value: string, defaultDir: string): boolean;
