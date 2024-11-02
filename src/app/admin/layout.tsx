import { Nav, NavLink } from "@/components/Nav";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  console.log(" -> ", children);
  return (
    <div>
      <Nav>
        <NavLink href="/admin">Dash Board</NavLink>
        <NavLink href="/admin/products">Products</NavLink>
        <NavLink href="/admin/users">Customer</NavLink>
      </Nav>
      <div className="flex justify-center">
        <div className="container mt-8">{children}</div>
      </div>
    </div>
  );
}
