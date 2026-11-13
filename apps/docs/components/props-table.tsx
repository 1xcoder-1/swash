export type PropRow = {
  name: string;
  type: string;
  default?: string;
  desc: string;
};

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="props-card">
      <table className="props">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td>
                <code className="prop-pill">{r.name}</code>
              </td>
              <td>{r.type}</td>
              <td>{r.default ?? "—"}</td>
              <td>{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
