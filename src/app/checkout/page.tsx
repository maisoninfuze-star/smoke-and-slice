import { STORE } from "@/lib/store";
import { CheckoutForm } from "@/components/CheckoutForm";
import { OrderingClosed } from "@/components/OrderingClosed";

export const metadata = { title: "Commander / Checkout" };

export default function CheckoutPage() {
  return STORE.onlineOrdering ? <CheckoutForm /> : <OrderingClosed />;
}
