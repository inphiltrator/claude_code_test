import type { RowDiff } from '@/types';

interface DiffCellProps {
  diff: RowDiff;
  columnIndex: number;
}

function calculateDelta(oldVal: string, newVal: string): string {
  const old = parseFloat(oldVal);
  const neu = parseFloat(newVal);

  if (!isNaN(old) && !isNaN(neu)) {
    const diff = neu - old;
    const sign = diff > 0 ? '+' : '';
    const formatted = Math.abs(diff) < 0.01
      ? diff.toExponential(2)
      : diff.toFixed(2);
    return `${sign}${formatted}`;
  }

  return '-';
}

function isNumeric(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
}

export function DiffCell({ diff, columnIndex }: DiffCellProps) {
  const columnDiff = diff.columnDiffs?.[columnIndex];

  if (!columnDiff) {
    return <span className="text-muted-foreground">-</span>;
  }

  if (diff.changeType === 'new') {
    return (
      <div className="text-green-700 dark:text-green-300 font-medium">
        {columnDiff.newValue}
      </div>
    );
  }

  if (diff.changeType === 'deleted') {
    return (
      <div className="text-red-700 dark:text-red-300 line-through">
        {columnDiff.oldValue}
      </div>
    );
  }

  if (diff.changeType === 'changed' && columnDiff.isDifferent) {
    const showDelta = isNumeric(columnDiff.oldValue) && isNumeric(columnDiff.newValue);
    const delta = showDelta ? calculateDelta(columnDiff.oldValue, columnDiff.newValue) : null;

    return (
      <div className="space-y-1">
        {/* Alter Wert */}
        <div className="text-gray-400 dark:text-gray-500 line-through text-xs">
          {columnDiff.oldValue}
        </div>

        {/* Neuer Wert */}
        <div className="text-blue-600 dark:text-blue-400 font-semibold">
          {columnDiff.newValue}
        </div>

        {/* Delta bei numerischen Werten */}
        {delta && delta !== '-' && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Δ {delta}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-gray-600 dark:text-gray-400">
      {columnDiff.newValue || columnDiff.oldValue}
    </div>
  );
}
