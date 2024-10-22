import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma"; // Prisma client to interact with the database

function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

// Fetches total sales data: sum of pricePaidInRs and the count of orders
async function getSalesData() {
  const data = await prisma?.order.aggregate({
    _sum: { pricePaidInRs: true },
    _count: true,
  });

  await wait(200);

  return {
    // If no sales, default amount to 0
    amount: data._sum.pricePaidInRs || 0,
    numberOfSales: data._count,
  };
}

// Fetches user data and calculates the average sales value per user
async function getUserData() {
  const [userCount, orderData] = await Promise.all([
    prisma.user.count(), // Get total user count
    prisma.order.aggregate({
      _sum: { pricePaidInRs: true }, // Aggregate total sales amount
    }),
  ]);

  return {
    userCount,
    // Calculate the average sales value per user (handle zero division)
    averageValuePerUser:
      userCount === 0 ? 0 : (orderData._sum.pricePaidInRs || 0) / userCount,
  };
}

// Fetches active and inactive product counts
async function getProductData() {
  const [activeCount, inactiveCount] = await Promise.all([
    prisma.product.count({ where: { isAvailableForPurchase: true } }), // Count active products
    prisma.product.count({ where: { isAvailableForPurchase: false } }), // Count inactive products
  ]);

  return { activeCount, inactiveCount };
}

// Main Admin Dashboard component
export default async function AdminDashboard() {
  // Fetch sales, user, and product data concurrently
  const [salesData, userData, productData] = await Promise.all([
    getSalesData(),
    getUserData(),
    getProductData(),
  ]);

  return (
    <div className="flex justify-center">
      {/* Responsive grid layout for displaying the dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 w-full max-w-6xl">
        {" "}
        {/* Set a max width */}
        <DashBoardCard
          title="Sales"
          subtitle={`${salesData.numberOfSales.toString()} Orders`} // Display number of orders
          body={`₹${salesData.amount.toString()}`} // Display total sales in ₹
        />
        <DashBoardCard
          title="Customer"
          subtitle={`₹${userData.averageValuePerUser.toString()} Average Value`} // Display average value per user
          body={`${userData.userCount.toString()}`} // Display user count
        />
        <DashBoardCard
          title="Active Products"
          subtitle={`${productData.inactiveCount.toString()} Inactive`} // Display inactive products count
          body={`${productData.activeCount.toString()}`} // Display active products count
        />
      </div>
    </div>
  );
}

// Reusable card component to display dashboard data
type DashBoardCardProps = {
  title: string; // Card title
  subtitle: string; // Card subtitle
  body: string; // Main content of the card (e.g., number or value)
};

// DashBoardCard component to display each card on the dashboard
function DashBoardCard({ title, subtitle, body }: DashBoardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle> {/* Card Title */}
      </CardHeader>
      <CardDescription>{subtitle}</CardDescription> {/* Card Subtitle */}
      <CardContent>{body}</CardContent> {/* Main content (value) */}
    </Card>
  );
}
