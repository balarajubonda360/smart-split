import { useEffect, useState } from 'react';

export const AdminDataTable = ({ title, load, columns, keyField = 'id' }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    load()
      .then(({ data }) => {
        const collection = Object.values(data.data).find(Array.isArray) || [];
        if (active) setRows(collection);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || `Could not load ${title.toLowerCase()}.`);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [load, reload, title]);

  return (
    <div className="page-section">
      <div className="page-header"><div><div className="eyebrow">Platform administration</div><h1>{title}</h1></div></div>
      {error && <div className="notice-box error" role="alert">{error}<button type="button" className="link-button" onClick={() => { setLoading(true); setError(''); setReload((value) => value + 1); }}>Retry</button></div>}
      <div className="table-card">
        <table>
          <thead><tr>{columns.map((column) => <th key={column.label} scope="col">{column.label}</th>)}</tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={columns.length} role="status">Loading {title.toLowerCase()}…</td></tr>
              : rows.length ? rows.map((row, index) => <tr key={row[keyField] || index}>{columns.map((column) => <td key={column.label}>{column.value(row)}</td>)}</tr>)
                : <tr><td colSpan={columns.length}>No {title.toLowerCase()} found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
