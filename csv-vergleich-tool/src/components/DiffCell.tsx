import type { RowDiff } from '@/types';

interface DiffCellProps {
  diff: RowDiff;
  columnIndex: number;
}

export function DiffCell({ diff, columnIndex }: DiffCellProps) {
  const columnDiff = diff.columnDiffs?.[columnIndex];

  if (!columnDiff) {
    return <span className="text-muted-foreground">-</span>;
  }

  if (diff.changeType === 'new') {
    return (
      <span className="text-green-700 dark:text-green-300 font-medium">
        {columnDiff.newValue}
      </span>
    );
  }

  if (diff.changeType === 'deleted') {
    return (
      <span className="text-red-700 dark:text-red-300 line-through">
        {columnDiff.oldValue}
      </span>
    );
  }

  if (diff.changeType === 'changed' && columnDiff.isDifferent) {
    return (
      <div
        className="flex items-center gap-2"
        title={`${columnDiff.oldValue} → ${columnDiff.newValue}`}
      >
        <span className="text-muted-foreground line-through text-xs">
          {columnDiff.oldValue}
        </span>
        <span className="text-yellow-700 dark:text-yellow-300 font-medium">
          {columnDiff.newValue}
        </span>
      </div>
    );
  }

  return <span className="text-foreground">{columnDiff.newValue || columnDiff.oldValue}</span>;
}
