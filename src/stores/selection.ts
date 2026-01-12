import { createSignal } from "solid-js";
import type { CellRef } from "@/types";

export const [selectionStart, setSelectionStart] = createSignal<CellRef | null>(
	null,
);
export const [selectionEnd, setSelectionEnd] = createSignal<CellRef | null>(
	null,
);
export const [isSelecting, setIsSelecting] = createSignal(false);

export function isCellSelected(
	tableId: string,
	row: number,
	col: number,
): boolean {
	const start = selectionStart();
	const end = selectionEnd();

	if (!start || !end) return false;
	if (start.tableId !== tableId || end.tableId !== tableId) return false;

	const minRow = Math.min(start.row, end.row);
	const maxRow = Math.max(start.row, end.row);
	const minCol = Math.min(start.col, end.col);
	const maxCol = Math.max(start.col, end.col);

	return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
}

export function clearSelection() {
	setSelectionStart(null);
	setSelectionEnd(null);
}

export const [selection, setSelection] = createSignal<{
	tire: string | null;
	rim: string | null;
	engine: string | null;
	ecu: string | null;
	turbo: string | null;
	intake: string | null;
	exhaust: string | null;
	suspension: string | null;
	brakes: string | null;
	gearbox: string | null;
	differential: string | null;
	driveShaft: string | null;
	body: string | null;
	hood: string | null;
	trunk: string | null;
}>({
	tire: null,
	rim: null,
	engine: null,
	ecu: null,
	turbo: null,
	intake: null,
	exhaust: null,
	suspension: null,
	brakes: null,
	gearbox: null,
	differential: null,
	driveShaft: null,
	body: null,
	hood: null,
	trunk: null,
});

export function clearSelectionPartSelection(): void {
	setSelection({
		tire: null,
		rim: null,
		engine: null,
		ecu: null,
		turbo: null,
		intake: null,
		exhaust: null,
		suspension: null,
		brakes: null,
		gearbox: null,
		differential: null,
		driveShaft: null,
		body: null,
		hood: null,
		trunk: null,
	});
}
