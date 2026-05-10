type DataTableProps = {
  title: string;
  columns: string[];
  rows: Array<Array<string | number | null>>;
};

export function DataTable({ title, columns, rows }: DataTableProps) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>No data yet.</td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={`${title}-${idx}`}>
                {row.map((value, i) => <td key={`${idx}-${i}`}>{String(value ?? "-")}</td>)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
