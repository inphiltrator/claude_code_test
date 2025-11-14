import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import type { ComparisonResult, RowDiff, ChangeFilter } from '@/types';
import { DiffCell } from './DiffCell';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ComparisonTableProps {
  result: ComparisonResult;
}

export function ComparisonTable({ result }: ComparisonTableProps) {
  const [filter, setFilter] = useState<ChangeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const data = useMemo(() => {
    let rows: RowDiff[] = [];
    switch (filter) {
      case 'new':
        rows = result.details.new;
        break;
      case 'changed':
        rows = result.details.changed;
        break;
      case 'deleted':
        rows = result.details.deleted;
        break;
      case 'all':
        rows = [
          ...result.details.new,
          ...result.details.changed,
          ...result.details.deleted,
        ];
        break;
    }

    // Filter by search term
    if (searchTerm) {
      rows = rows.filter((row) =>
        row.key.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return rows;
  }, [result, filter, searchTerm]);

  const columns = useMemo<ColumnDef<RowDiff>[]>(() => {
    // Get headers from the first row
    const sampleRow = result.details.changed[0] || result.details.new[0] || result.details.deleted[0];
    const headers = sampleRow?.columnDiffs?.map(d => d.columnName) || [];

    return [
      {
        accessorKey: 'changeType',
        header: 'Typ',
        cell: ({ row }) => {
          const type = row.original.changeType;
          const colors = {
            new: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            changed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            deleted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          };
          const labels = {
            new: 'Neu',
            changed: 'Geändert',
            deleted: 'Gelöscht',
          };
          return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${colors[type]}`}>
              {labels[type]}
            </span>
          );
        },
      },
      ...headers.map((header, index) => ({
        id: `col_${index}`,
        header: header,
        cell: ({ row }: { row: any }) => (
          <DiffCell diff={row.original} columnIndex={index} />
        ),
      })),
    ];
  }, [result]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Vergleich: {result.baselineFileName} vs {result.comparedFileName}
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Alle ({result.summary.newRows + result.summary.changedRows + result.summary.deletedRows})
          </Button>
          <Button
            variant={filter === 'new' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('new')}
          >
            Neu ({result.summary.newRows})
          </Button>
          <Button
            variant={filter === 'changed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('changed')}
          >
            Geändert ({result.summary.changedRows})
          </Button>
          <Button
            variant={filter === 'deleted' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('deleted')}
          >
            Gelöscht ({result.summary.deletedRows})
          </Button>
        </div>
        <Input
          placeholder="Suche nach Schlüssel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-2"
        />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/50 cursor-pointer hover:bg-muted"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {table.getRowModel().rows.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Keine Ergebnisse gefunden
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
