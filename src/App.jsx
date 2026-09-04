import { useEffect, useState } from "react";

const API_URL = "/api" || "http://localhost:5000/api";

function App() {
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadEmployees() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/employees?page=${page}&limit=10`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`API returned HTTP ${response.status}`);
        }

        const body = await response.json();
        setEmployees(body.data);
        setPagination(body.pagination);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Unable to load employees. Is the Flask API running?");
        }
      } finally {
        setLoading(false);
      }
    }

    loadEmployees();
    return () => controller.abort();
  }, [page]);

  return (
    <main className="page">
      <section className="container">
        <header className="hero">
          <div>
            <p className="eyebrow">DEVOPS DEMO</p>
            <h1>Employee Directory</h1>
            <p className="subtitle">
              React frontend consuming a RESTful Flask API.
            </p>
          </div>
          <div className="status">
            <span className="status-dot" />
            API-backed
          </div>
        </header>

        <section className="card">
          <div className="card-header">
            <div>
              <h2>Employees</h2>
              <p>
                {pagination
                  ? `Showing ${employees.length} of ${pagination.total} employees`
                  : "Loading employee data..."}
              </p>
            </div>
          </div>

          {loading && <div className="message">Loading...</div>}
          {error && <div className="message error">{error}</div>}

          {!loading && !error && (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Role</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id}>
                        <td>#{employee.id}</td>
                        <td>
                          <strong>
                            {employee.first_name} {employee.last_name}
                          </strong>
                        </td>
                        <td>{employee.department}</td>
                        <td>{employee.role}</td>
                        <td>{employee.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <button
                  onClick={() => setPage((current) => current - 1)}
                  disabled={page === 1}
                >
                  ← Previous
                </button>

                <div className="pages">
                  {Array.from(
                    { length: pagination?.total_pages || 0 },
                    (_, index) => index + 1
                  ).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      className={pageNumber === page ? "active" : ""}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage((current) => current + 1)}
                  disabled={page === pagination?.total_pages}
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
