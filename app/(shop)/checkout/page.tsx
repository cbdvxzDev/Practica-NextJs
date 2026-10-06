"use client";

import { useIsMounted } from "@/hooks/useIsMounted";
import * as React from "react";
import { useRouter } from "next/navigation";
import { PageTitle } from "../../components/common/PageTitle";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useCartStore } from "../../store/cart.store";
import { useAuthStore } from "../../store/auth.store";
import { useOrderStore } from "../../store/order.store";

type PaymentMethod = "card" | "cash";

interface AddressForm {
  recipient: string;
  street: string;
  apt: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  reference: string;
}

const EMPTY_ADDRESS: AddressForm = {
  recipient: "",
  street: "",
  apt: "",
  city: "",
  state: "",
  postalCode: "",
  phone: "",
  reference: "",
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatCardNumber = (value: string) =>
  onlyDigits(value)
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();

const formatExpiry = (value: string) => {
  const digits = onlyDigits(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

/** Dirección en texto plano para la API, en un orden legible y estable. */
const formatAddress = (address: AddressForm) => {
  const line = [address.street.trim(), address.apt.trim()].filter(Boolean).join(", ");
  return [line, address.city.trim(), address.state.trim(), address.postalCode.trim()]
    .filter(Boolean)
    .join(", ");
};

const validateCard = (cardNumber: string, cardName: string, expiry: string, cvc: string) => {
  const digits = onlyDigits(cardNumber);
  if (digits.length < 13 || digits.length > 19) return "Revisa el número de tarjeta.";
  if (!cardName.trim()) return "Escribe el nombre tal como aparece en la tarjeta.";

  const [monthRaw, yearRaw] = expiry.split("/");
  const month = Number(monthRaw);
  const year = 2000 + Number(yearRaw);
  const now = new Date();
  if (!monthRaw || !yearRaw || month < 1 || month > 12) return "El vencimiento debe ir en formato MM/AA.";
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
    return "La tarjeta está vencida.";
  }

  if (onlyDigits(cvc).length < 3 || onlyDigits(cvc).length > 4) return "El CVC no es válido.";
  return null;
};

export default function CheckoutPage() {
  const isMounted = useIsMounted();
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const createOrder = useOrderStore((state) => state.createOrder);

  const [address, setAddress] = React.useState<AddressForm>(EMPTY_ADDRESS);
  const [method, setMethod] = React.useState<PaymentMethod>("card");
  const [card, setCard] = React.useState({ number: "", name: "", expiry: "", cvc: "" });
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState("");

  // El nombre del destinatario se rellena con la cuenta en cuanto el store
  // hidrata; el ajuste va durante el render (patrón de la página de perfil)
  // para no abrir un effect que dispare un render en cascada.
  const [syncedRecipient, setSyncedRecipient] = React.useState<string | undefined>(undefined);
  if (syncedRecipient !== user?.name) {
    setSyncedRecipient(user?.name);
    setAddress((prev) => (prev.recipient ? prev : { ...prev, recipient: user?.name ?? "" }));
  }

  if (isMounted && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
        <h1 className="text-2xl font-medium">Inicia sesión para continuar</h1>
        <p className="text-sm text-brand-muted max-w-sm">
          Necesitas una cuenta para completar tu compra.
        </p>
        <Button variant="primary" onClick={() => router.push("/login")}>
          Iniciar sesión
        </Button>
      </div>
    );
  }

  if (isMounted && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
        <h1 className="text-2xl font-medium">Tu carrito está vacío</h1>
        <Button variant="primary" onClick={() => router.push("/products")}>
          Ir al catálogo
        </Button>
      </div>
    );
  }

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = subtotal >= 200000 ? 0 : 12000;
  const total = subtotal + shippingCost;

  const setAddressField = (field: keyof AddressForm) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setAddress((prev) => ({ ...prev, [field]: event.target.value }));

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isProcessing) return;

    const shippingAddress = formatAddress(address);
    if (!address.street.trim() || !address.city.trim() || !address.state.trim()) {
      setError("Completa la calle, la ciudad y el departamento de envío.");
      return;
    }

    const cardError =
      method === "card"
        ? validateCard(card.number, card.name, card.expiry, card.cvc)
        : null;
    if (cardError) {
      setError(cardError);
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // La mini API valida stock, calcula el total y descuenta inventario.
      const order = await createOrder({
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity, size: i.size })),
        shippingAddress,
        paymentStatus: method === "card" ? "paid" : "pending",
      });

      clearCart();
      router.push(`/checkout/success?order=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo procesar el pedido.");
      setIsProcessing(false);
    }
  };

  const payLabel = method === "card" ? `Pagar $${total.toLocaleString("es-CO")}` : "Confirmar pedido";

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="border-b border-border pb-5">
        <PageTitle
          title="Finalizar Compra"
          description="Revisa la dirección de envío, elige cómo pagar y confirma tu pedido."
        />
      </div>

      <form onSubmit={handleConfirmOrder} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-border/60 rounded-card p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark border-b border-border/30 pb-3">
              Dirección de envío
            </h3>

            <Input
              label="Nombre de quien recibe"
              placeholder="Nombre completo"
              value={address.recipient}
              onChange={setAddressField("recipient")}
              autoComplete="name"
            />

            <Input
              label="Calle y número"
              placeholder="Calle 123 #45-67"
              value={address.street}
              onChange={setAddressField("street")}
              autoComplete="address-line1"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Apartamento, oficina..."
                placeholder="Apto 201 (opcional)"
                value={address.apt}
                onChange={setAddressField("apt")}
                autoComplete="address-line2"
              />
              <Input
                label="Ciudad"
                placeholder="Bogotá D.C."
                value={address.city}
                onChange={setAddressField("city")}
                autoComplete="address-level2"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Departamento / Estado"
                placeholder="Cundinamarca"
                value={address.state}
                onChange={setAddressField("state")}
                autoComplete="address-level1"
                required
              />
              <Input
                label="Código postal"
                placeholder="110231 (opcional)"
                value={address.postalCode}
                onChange={setAddressField("postalCode")}
                autoComplete="postal-code"
                inputMode="numeric"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Teléfono de contacto"
                placeholder="300 123 4567 (opcional)"
                value={address.phone}
                onChange={setAddressField("phone")}
                autoComplete="tel"
                inputMode="tel"
              />
              <Input
                label="Referencia para el courier"
                placeholder="Portón negro, torre B"
                value={address.reference}
                onChange={setAddressField("reference")}
              />
            </div>
          </div>

          <div className="bg-white border border-border/60 rounded-card p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark border-b border-border/30 pb-3">
              Método de pago
            </h3>

            <fieldset className="space-y-2">
              <legend className="sr-only">Método de pago</legend>
              {[
                {
                  value: "card" as const,
                  title: "Tarjeta de crédito o débito",
                  hint: "Aprobación inmediata en el entorno de demostración.",
                },
                {
                  value: "cash" as const,
                  title: "Pago contra entrega",
                  hint: "Pagas en efectivo cuando recibes el pedido. Queda pendiente.",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-button border cursor-pointer transition-colors ${
                    method === option.value
                      ? "border-brand-dark bg-brand-light/40"
                      : "border-border hover:bg-neutral-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={option.value}
                    checked={method === option.value}
                    onChange={() => setMethod(option.value)}
                    className="mt-1 accent-brand-dark"
                  />
                  <span className="space-y-0.5">
                    <span className="block text-sm font-medium text-brand-dark">{option.title}</span>
                    <span className="block text-xs text-brand-muted">{option.hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            {method === "card" ? (
              <div className="space-y-4 pt-2 border-t border-border/30">
                <Input
                  label="Número de tarjeta"
                  placeholder="4242 4242 4242 4242"
                  value={card.number}
                  onChange={(e) => setCard((prev) => ({ ...prev, number: formatCardNumber(e.target.value) }))}
                  inputMode="numeric"
                  autoComplete="cc-number"
                />
                <Input
                  label="Nombre en la tarjeta"
                  placeholder="COMO APARECE IMPRESO"
                  value={card.name}
                  onChange={(e) => setCard((prev) => ({ ...prev, name: e.target.value }))}
                  autoComplete="cc-name"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Vencimiento"
                    placeholder="MM/AA"
                    value={card.expiry}
                    onChange={(e) => setCard((prev) => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                    inputMode="numeric"
                    autoComplete="cc-exp"
                  />
                  <Input
                    label="CVC"
                    placeholder="123"
                    value={card.cvc}
                    onChange={(e) =>
                      setCard((prev) => ({ ...prev, cvc: onlyDigits(e.target.value).slice(0, 4) }))
                    }
                    inputMode="numeric"
                    autoComplete="cc-csc"
                  />
                </div>
                <p className="text-[11px] text-brand-muted bg-neutral-50 border border-border/40 rounded-button px-3 py-2">
                  Entorno de demostración: no se guarda ningún dato de tarjeta ni se realiza ningún cobro real.
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-brand-muted bg-neutral-50 border border-border/40 rounded-button px-3 py-2">
                El pedido se marcará como pago pendiente hasta que el repartidor confirme la entrega.
              </p>
            )}
          </div>

          <div className="bg-white border border-border/60 rounded-card p-6 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark border-b border-border/30 pb-3">
              Productos
            </h3>
            {items.map((item) => (
              <div key={item.lineId} className="flex justify-between text-xs text-brand-muted">
                <span>
                  {item.name}
                  {item.size && <span className="text-brand-dark font-medium uppercase"> ({item.size})</span>} × {item.quantity}
                </span>
                <span className="font-medium text-brand-dark">
                  ${(item.price * item.quantity).toLocaleString("es-CO")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-neutral-50/50 border border-border/40 rounded-card p-6 space-y-4 sticky top-24">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark">
              Resumen
            </h3>
            <div className="space-y-2 text-xs border-b border-border/30 pb-4">
              <div className="flex justify-between text-brand-muted">
                <span>Subtotal</span>
                <span className="font-medium text-brand-dark">${subtotal.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Envío</span>
                <span className="font-medium text-brand-dark">
                  {shippingCost === 0 ? "Gratis" : `$${shippingCost.toLocaleString("es-CO")}`}
                </span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Pago</span>
                <span className="font-medium text-brand-dark">
                  {method === "card" ? "Tarjeta" : "Contra entrega"}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-semibold uppercase text-brand-dark">Total</span>
              <span className="text-lg font-bold text-brand-dark">${total.toLocaleString("es-CO")}</span>
            </div>
            <Button type="submit" disabled={isProcessing} className="w-full h-11 text-xs font-semibold uppercase tracking-wider">
              {isProcessing ? "Procesando pago..." : payLabel}
            </Button>
            {error && (
              <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-button px-3 py-2" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
