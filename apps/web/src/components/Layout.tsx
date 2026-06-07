import { NavLink, Outlet } from "react-router";

export function Layout() {
  return (
    <div className="page">
      <header className="header">
        <h1>Poker Trainer</h1>
        <nav className="nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "link active" : "link")}
          >
            Home
          </NavLink>
          <NavLink
            to="/drills"
            className={({ isActive }) => (isActive ? "link active" : "link")}
          >
            Drills
          </NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
