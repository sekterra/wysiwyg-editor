import { dom } from '../../../../helper';

/** @type {Object.<string, string[]>} */
const TAG_GROUPS = {
	bold: ['STRONG', 'B'],
	italic: ['EM', 'I'],
	underline: ['U'],
	strike: ['DEL', 'S', 'STRIKE'],
	subscript: ['SUB'],
	superscript: ['SUP'],
};

/** @type {Object.<string, string[]|null>} — keys match post-`_defaultTagCommand` names (same as `CommandExecutor` StyleMap) */
const STYLE_MAP = {
	bold: ['font-weight'],
	underline: ['text-decoration'],
	italic: ['font-style'],
	strike: ['text-decoration'],
	subscript: null,
	superscript: null,
};

/**
 * @description When toolbar click causes blur, the Table plugin may reset multi-cell selection state.
 * Restore minimal state + visual classes so bulk-format actions can apply consistently and the selection block isn't "canceled".
 *
 * @param {SunEditor.Deps} $
 * @param {HTMLTableCellElement[]} cells
 */
function restoreTableMultiSelectionState($, cells) {
	const table = $.plugins?.table;
	if (!table?.state || !cells?.length) return;

	// restore plugin state (best-effort)
	table.state.selectedCells = cells;
	table.state.fixedCell = cells[0];
	table.state.selectedCell = dom.query.findVisualLastCell?.(cells) || cells[cells.length - 1];
	table.state.selectedTable = cells[0].closest('table');

	// restore visual classes (they may have been cleared during blur/controller off)
	for (let i = 0; i < cells.length; i++) {
		dom.utils.addClass(cells[i], 'se-selected-table-cell');
	}
}

/**
 * @param {SunEditor.Deps} $
 * @param {HTMLTableCellElement[]} cells
 */
function finalizeMultiCellFormat($, cells) {
	restoreTableMultiSelectionState($, cells);
	// keep a collapsed caret inside the first cell to avoid table controller cleaning up selection styles
	const cell = cells[0];
	const anchor = cell.querySelector?.('div') || cell;
	try {
		$.selection.setRange(anchor, 0, anchor, 0);
	} catch {
		/* ignore */
	}
	$.store.set('_lastSelectionNode', null);
	$.focusManager.focus();
}

/**
 * @param {SunEditor.Deps} $
 * @returns {HTMLTableCellElement[]|null}
 */
export function getMultiSelectedTableCells($) {
	const table = $.plugins?.table;
	const live = table?.state?.selectedCells;
	if (live?.length >= 2) {
		$.store.set('_tableMultiCellFormatSnapshot', null);
		const ok = /** @type {HTMLTableCellElement[]} */ (live.slice().filter((c) => c?.isConnected));
		if (ok.length >= 2) restoreTableMultiSelectionState($, ok);
		return ok.length >= 2 ? ok : null;
	}
	const snap = /** @type {HTMLTableCellElement[]|null|undefined} */ ($.store.get('_tableMultiCellFormatSnapshot'));
	if (snap?.length >= 2) {
		$.store.set('_tableMultiCellFormatSnapshot', null);
		const ok = snap.slice().filter((c) => c?.isConnected);
		if (ok.length >= 2) restoreTableMultiSelectionState($, /** @type {HTMLTableCellElement[]} */ (ok));
		return ok.length >= 2 ? /** @type {HTMLTableCellElement[]} */ (ok) : null;
	}
	return null;
}

/**
 * @param {SunEditor.Deps} $
 * @param {HTMLTableCellElement} cell
 */
export function selectCellContentsRange($, cell) {
	const doc = $.frameContext.get('_wd');
	const range = doc.createRange();
	try {
		range.selectNodeContents(cell);
	} catch {
		return;
	}
	$.selection.setRange(range);
}

/**
 * @param {HTMLElement} cell
 * @param {string[]} tagNames
 * @returns {boolean}
 */
function cellTextFullyWrappedByTags(cell, tagNames) {
	const upper = tagNames.map((t) => t.toUpperCase());
	let hasText = false;
	const walker = cell.ownerDocument.createTreeWalker(cell, NodeFilter.SHOW_TEXT, null);
	let n = walker.nextNode();
	while (n) {
		const t = n.textContent || '';
		if (!/[^\s\u200b]/u.test(t)) {
			n = walker.nextNode();
			continue;
		}
		hasText = true;
		let p = /** @type {HTMLElement|null} */ (n.parentElement);
		let hit = false;
		while (p && cell.contains(p)) {
			if (upper.includes(p.nodeName)) {
				hit = true;
				break;
			}
			p = p.parentElement;
		}
		if (!hit) return false;
		n = walker.nextNode();
	}
	return hasText;
}

/**
 * @param {SunEditor.Deps} $
 * @param {string} command Toolbar command (e.g. bold)
 * @returns {boolean} true if multi-cell bulk handled
 */
export function tryBulkFontStyle($, command) {
	const cells = getMultiSelectedTableCells($);
	if (!cells) return false;

	restoreTableMultiSelectionState($, cells);

	let cmdResolved = $.options.get('_defaultTagCommand')[command.toLowerCase()] || command;
	let nodeName = $.options.get('convertTextTags')[cmdResolved] || cmdResolved;
	const mapKey = String(cmdResolved).toLowerCase();
	const tagGroup = TAG_GROUPS[mapKey];
	if (!tagGroup) return false;

	const shouldRemove = cells.every((cell) => cellTextFullyWrappedByTags(cell, tagGroup));

	$.history.pause();
	try {
		for (let c = 0; c < cells.length; c++) {
			selectCellContentsRange($, cells[c]);
			let nm = nodeName;
			const nodesMap = $.store.get('currentNodesMap');
			if (/^sub$/i.test(nm) && nodesMap.includes('superscript')) nm = 'sub';
			else if (/^sup$/i.test(nm) && nodesMap.includes('subscript')) nm = 'sup';

			const el = shouldRemove ? null : dom.utils.createElement(nm);
			$.inline.apply(el, { stylesToModify: STYLE_MAP[mapKey] || null, nodesToRemove: [nm], strictRemove: false });
		}
	} finally {
		$.history.resume();
		$.history.push(false);
	}
	finalizeMultiCellFormat($, cells);
	return true;
}

/**
 * @param {SunEditor.Deps} $
 * @param {(cell: HTMLTableCellElement) => void} fn
 * @returns {boolean}
 */
export function withMultiTableCellsHistory($, fn) {
	const cells = getMultiSelectedTableCells($);
	if (!cells) return false;
	restoreTableMultiSelectionState($, cells);
	$.history.pause();
	try {
		for (let i = 0; i < cells.length; i++) {
			selectCellContentsRange($, cells[i]);
			fn(cells[i]);
		}
	} finally {
		$.history.resume();
		$.history.push(false);
	}
	finalizeMultiCellFormat($, cells);
	return true;
}

/**
 * @param {SunEditor.Deps} $
 * @param {string} value align `data-command`
 * @param {string} defaultDir
 * @returns {boolean}
 */
export function tryBulkTableAlign($, value, defaultDir) {
	const cells = getMultiSelectedTableCells($);
	if (!cells) return false;
	restoreTableMultiSelectionState($, cells);

	const alignVal = value === defaultDir ? '' : value;

	$.history.pause();
	try {
		for (let i = 0; i < cells.length; i++) {
			selectCellContentsRange($, cells[i]);
			const selectedFormsts = $.format.getLines();
			for (let j = 0, len = selectedFormsts.length; j < len; j++) {
				dom.utils.setStyle(selectedFormsts[j], 'textAlign', alignVal);
			}
		}
	} finally {
		$.history.resume();
		$.history.push(false);
	}
	finalizeMultiCellFormat($, cells);
	return true;
}
