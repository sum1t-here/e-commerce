import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
} from "@react-email/components";
import { OrderInformation } from "./_components/OrderInformation";

type PurchaseReceiptEmailProps = {
  product: {
    name: string;
    imagePath: string;
    description: string;
  };
  order: { id: string; createdAt: Date; pricePaidInRs: number };
  downloadVerificationId: string;
};

export const previewProps: PurchaseReceiptEmailProps = {
  product: {
    name: "Product name",
    description: "Some description",
    imagePath:
      "/products/5aba7442-e4a5-4d2e-bfa7-5bd358cdad64-02 - What Is Next.js.jpg",
  },
  order: {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    pricePaidInRs: 10000,
  },
  downloadVerificationId: crypto.randomUUID(),
};

export default function PurchaseReceiptEmail({
  product,
  order,
  downloadVerificationId,
}: PurchaseReceiptEmailProps) {
  return (
    <Html>
      <Preview>Download {product.name} and view receipt</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          <Container className="max-w-xl">
            <Heading>Purchase Receipt</Heading>
            <OrderInformation
              order={order}
              product={product}
              downloadVerificationId={downloadVerificationId}
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
