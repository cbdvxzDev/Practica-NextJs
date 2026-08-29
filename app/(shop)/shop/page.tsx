import { redirect } from "next/navigation";

// "/shop" es un alias amigable del catálogo completo (/products), usado por el footer.
export default function ShopRedirectPage() {
  redirect("/products");
}
