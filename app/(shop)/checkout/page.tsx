"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "../../compents/ui/Button";
import { useCartStore } from "../../store/cart.store";
import { useAuthStore } from "../../store/auth.store";
import { useOrdersStore } from "../../store/orders.store";
import { useInventoryStore } from "../../store/inventory.store";

const formatMoney = (value: number) => `$${value.toLocaleString("es-CO")}`;

interface DeliveryFormValues {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
}

interface PaymentFormValues {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardName: string;
}

const CARD_NUMBER_REGEX = /^\d{13,19}$/;
const EXPIRY_REGEX = /^(0[1-9]|1[0-2])\/\d{2}$/;
const CVV_REGEX = /^\d{3,4}$/;
const PHONE_REGEX = /^[\d\s+()-]{7,20}$/;

function validateDelivery(values: DeliveryFormValues) {
  const errors: Partial<Record<keyof DeliveryFormValues, string>> = {};

  if (!values.name.trim() || values.name.trim().length < 3) {
    errors.name = "Ingresa tu nombre completo.";
  }
  if (!PHONE_REGEX.test(values.phone.trim())) {
    errors.phone = "Ingresa un teléfono válido.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Ingresa un correo electrónico válido.";
  }
  if (!values.address.trim() || values.address.trim().length < 5) {
    errors.address = "Ingresa una dirección completa.";
  }
  if (!values.city.trim()) {
    errors.city = "Ingresa tu ciudad.";
  }
  if (!/^\d{4,10}$/.test(values.postalCode.trim())) {
    errors.postalCode = "Ingresa un código postal válido.";
  }

  return errors;
}

function validatePayment(values: PaymentFormValues) {
  const errors: Partial<Record<keyof PaymentFormValues, string>> = {};
  const digitsOnly = values.cardNumber.replace(/\s/g, "");

  if (!CARD_NUMBER_REGEX.test(digitsOnly)) {
    errors.cardNumber = "Número de tarjeta inválido (13 a 19 dígitos).";
  }
  if (!EXPIRY_REGEX.test(values.expiry.trim())) {
    errors.expiry = "Formato válido: MM/AA.";
  } else {
    const [month, year] = values.expiry.trim().split("/").map(Number);
    const expiryDate = new Date(2000 + year, month);
    if (expiryDate < new Date()) {
      errors.expiry = "La tarjeta está vencida.";
    }
  }
  if (!CVV_REGEX.test(values.cvv.trim())) {
    errors.cvv = "CVV inválido.";
  }
  if (!values.cardName.trim() || values.cardName.trim().length < 3) {
    errors.cardName = "Ingresa el nombre tal como aparece en la tarjeta.";
  }

  return errors;
}

const emptyDelivery: DeliveryFormValues = { name: "", phone: "", email: "", address: "", city: "", postalCode: "" };
const emptyPayment: PaymentFormValues = { cardNumber: "", expiry: "", cvv: "", cardName: "" };

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const user = useAuthStore((state) => state.user);
  const addOrder = useOrdersStore((state) => state.addOrder);
  const decrementStock = useInventoryStore((state) => state.decrementStock);

  const [step, setStep] = React.useState<"details" | "payment" | "success">("details");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const [confirmedOrderId, setConfirmedOrderId] = React.useState<string | null>(null);

  const [delivery, setDelivery] = React.useState<DeliveryFormValues>(emptyDelivery);
  const [deliveryErrors, setDeliveryErrors] = React.useState<Partial<Record<keyof DeliveryFormValues, string>>>({});

  const [payment, setPayment] = React.useState<PaymentFormValues>(emptyPayment);
  const [paymentErrors, setPaymentErrors] = React.useState<Partial<Record<keyof PaymentFormValues, string>>>({});

  // Precarga los datos del cliente autenticado para agilizar el formulario.
  React.useEffect(() => {
    if (user) {
      setDelivery((prev) => ({ ...prev, name: prev.name || user.name, email: prev.email || user.email }));
    }
  }, [user]);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal >= 150000 || subtotal === 0 ? 0 : 12000;
  const total = subtotal + shipping;

  if (step === "success" && confirmedOrderId) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center space-y-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">✓</div>
        <h1 className="text-3xl font-medium">¡Pedido confirmado!</h1>
        <p className="text-sm leading-relaxed text-brand-muted">
          Tu número de pedido es <span className="font-semibold text-brand-dark">{confirmedOrderId}</span>. Te
          enviaremos la confirmación y el seguimiento a tu correo.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/profile"><Button variant="secondary">Ver mis pedidos</Button></Link>
          <Link href="/products"><Button>Seguir comprando</Button></Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-2xl font-medium">Tu carrito está vacío</h1>
        <Link href="/products"><Button>Volver al catálogo</Button></Link>
      </div>
    );
  }

  const handleDeliveryChange = (field: keyof DeliveryFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setDelivery((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handlePaymentChange = (field: keyof PaymentFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPayment((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (step === "details") {
      const errors = validateDelivery(delivery);
      setDeliveryErrors(errors);
      if (Object.keys(errors).length > 0) {
        setFormError("Revisa los campos marcados antes de continuar.");
        return;
      }
      setStep("payment");
      return;
    }

    const errors = validatePayment(payment);
    setPaymentErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError("Revisa los datos de pago antes de confirmar.");
      return;
    }

    setIsProcessing(true);
    window.setTimeout(() => {
      // Descontar stock real de cada producto comprado.
      items.forEach((item) => decrementStock(item.id, item.quantity));

      const order = addOrder({
        customerName: delivery.name.trim(),
        customerEmail: delivery.email.trim(),
        phone: delivery.phone.trim(),
        address: delivery.address.trim(),
        city: delivery.city.trim(),
        postalCode: delivery.postalCode.trim(),
        items: items.map((item) => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity, image: item.image })),
        subtotal,
        shipping,
        total,
      });

      clearCart();
      setIsProcessing(false);
      setConfirmedOrderId(order.id);
      setStep("success");
    }, 900);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="border-b border-border pb-6">
        <Link href="/cart" className="text-xs text-brand-muted underline underline-offset-4">← Volver al carrito</Link>
        <h1 className="mt-5 text-3xl font-medium tracking-tight">Finalizar compra</h1>
        <div className="mt-6 flex max-w-md items-center gap-3 text-xs font-semibold uppercase tracking-wider">
          <span className={step === "details" ? "text-brand-dark" : "text-brand-muted"}>1. Entrega</span>
          <span className="h-px flex-1 bg-border" />
          <span className={step === "payment" ? "text-brand-dark" : "text-brand-muted"}>2. Pago</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {step === "details" ? (
            <>
              <section className="rounded-card border border-border/60 bg-white p-6">
                <h2 className="text-lg font-medium">Datos de entrega</h2>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="text-xs font-medium">
                    Nombre completo
                    <input
                      name="name"
                      autoComplete="name"
                      value={delivery.name}
                      onChange={handleDeliveryChange("name")}
                      aria-invalid={Boolean(deliveryErrors.name)}
                      className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
                    />
                    {deliveryErrors.name && <span className="mt-1 block text-xs text-red-600">{deliveryErrors.name}</span>}
                  </label>
                  <label className="text-xs font-medium">
                    Teléfono
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={delivery.phone}
                      onChange={handleDeliveryChange("phone")}
                      aria-invalid={Boolean(deliveryErrors.phone)}
                      className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
                    />
                    {deliveryErrors.phone && <span className="mt-1 block text-xs text-red-600">{deliveryErrors.phone}</span>}
                  </label>
                  <label className="text-xs font-medium sm:col-span-2">
                    Correo electrónico
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={delivery.email}
                      onChange={handleDeliveryChange("email")}
                      aria-invalid={Boolean(deliveryErrors.email)}
                      className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
                    />
                    {deliveryErrors.email && <span className="mt-1 block text-xs text-red-600">{deliveryErrors.email}</span>}
                  </label>
                  <label className="text-xs font-medium sm:col-span-2">
                    Dirección
                    <input
                      name="address"
                      autoComplete="street-address"
                      value={delivery.address}
                      onChange={handleDeliveryChange("address")}
                      aria-invalid={Boolean(deliveryErrors.address)}
                      className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
                    />
                    {deliveryErrors.address && <span className="mt-1 block text-xs text-red-600">{deliveryErrors.address}</span>}
                  </label>
                  <label className="text-xs font-medium">
                    Ciudad
                    <input
                      name="city"
                      autoComplete="address-level2"
                      value={delivery.city}
                      onChange={handleDeliveryChange("city")}
                      aria-invalid={Boolean(deliveryErrors.city)}
                      className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
                    />
                    {deliveryErrors.city && <span className="mt-1 block text-xs text-red-600">{deliveryErrors.city}</span>}
                  </label>
                  <label className="text-xs font-medium">
                    Código postal
                    <input
                      name="postalCode"
                      inputMode="numeric"
                      value={delivery.postalCode}
                      onChange={handleDeliveryChange("postalCode")}
                      aria-invalid={Boolean(deliveryErrors.postalCode)}
                      className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
                    />
                    {deliveryErrors.postalCode && <span className="mt-1 block text-xs text-red-600">{deliveryErrors.postalCode}</span>}
                  </label>
                </div>
              </section>
              <section className="rounded-card border border-border/60 bg-white p-6">
                <h2 className="text-lg font-medium">Método de entrega</h2>
                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-button border border-brand-dark bg-brand-light p-4 text-sm">
                  <input type="radio" name="shipping" defaultChecked />
                  <span>
                    <strong>Entrega estándar</strong>
                    <span className="mt-1 block text-xs text-brand-muted">2 a 5 días hábiles · {shipping === 0 ? "Gratis" : formatMoney(shipping)}</span>
                  </span>
                </label>
              </section>
            </>
          ) : (
            <section className="rounded-card border border-border/60 bg-white p-6">
              <h2 className="text-lg font-medium">Método de pago</h2>
              <p className="mt-2 text-sm text-brand-muted">Demo segura: no se realizará ningún cobro real.</p>
              <div className="mt-5 space-y-4">
                <label className="block text-xs font-medium">
                  Número de tarjeta
                  <input
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    value={payment.cardNumber}
                    onChange={handlePaymentChange("cardNumber")}
                    aria-invalid={Boolean(paymentErrors.cardNumber)}
                    className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
                  />
                  {paymentErrors.cardNumber && <span className="mt-1 block text-xs text-red-600">{paymentErrors.cardNumber}</span>}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="text-xs font-medium">
                    Vencimiento
                    <input
                      placeholder="MM/AA"
                      value={payment.expiry}
                      onChange={handlePaymentChange("expiry")}
                      aria-invalid={Boolean(paymentErrors.expiry)}
                      className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
                    />
                    {paymentErrors.expiry && <span className="mt-1 block text-xs text-red-600">{paymentErrors.expiry}</span>}
                  </label>
                  <label className="text-xs font-medium">
                    CVV
                    <input
                      inputMode="numeric"
                      placeholder="123"
                      value={payment.cvv}
                      onChange={handlePaymentChange("cvv")}
                      aria-invalid={Boolean(paymentErrors.cvv)}
                      className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
                    />
                    {paymentErrors.cvv && <span className="mt-1 block text-xs text-red-600">{paymentErrors.cvv}</span>}
                  </label>
                </div>
                <label className="block text-xs font-medium">
                  Nombre en la tarjeta
                  <input
                    value={payment.cardName}
                    onChange={handlePaymentChange("cardName")}
                    aria-invalid={Boolean(paymentErrors.cardName)}
                    className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
                  />
                  {paymentErrors.cardName && <span className="mt-1 block text-xs text-red-600">{paymentErrors.cardName}</span>}
                </label>
              </div>
              <button
                type="button"
                onClick={() => setStep("details")}
                className="mt-4 text-xs text-brand-muted underline underline-offset-4"
              >
                ← Editar datos de entrega
              </button>
            </section>
          )}
          {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
          <Button type="submit" isLoading={isProcessing} className="w-full sm:w-auto">
            {step === "details" ? "Continuar al pago" : "Confirmar pedido"}
          </Button>
        </form>
        <aside className="h-fit rounded-card border border-border/60 bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-medium">Resumen</h2>
          <div className="mt-5 space-y-3 border-b border-border pb-5 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4">
                <span className="text-brand-muted">{item.name} × {item.quantity}</span>
                <span>{formatMoney(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-muted">Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Envío</span>
              <span>{shipping === 0 ? "Gratis" : formatMoney(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-4 text-base font-semibold">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
