import { Nav, NavLink } from "@/components/Nav";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <Nav>
        <NavLink href="/">Home</NavLink>
        <NavLink href="/products">Products</NavLink>
        <NavLink href="/orders">My Orders</NavLink>
      </Nav>
      <div className="flex justify-center">
        <div className="container mt-8">{children}</div>
      </div>
    </div>
  );
}
