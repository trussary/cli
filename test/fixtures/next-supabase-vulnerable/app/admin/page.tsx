// Intentionally vulnerable fixture: an admin screen with no identity check.
export default async function AdminPage() {
  return (
    <main>
      <h1>Admin</h1>
      <p>Everything about everyone.</p>
    </main>
  );
}
