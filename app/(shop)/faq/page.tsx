import type { Metadata } from "next";
import { CONFIG } from "@/constants/config";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Resolvemos las dudas más comunes sobre pagos, envíos, tallas y devoluciones.",
};

const FAQ_ITEMS = [
  {
    question: "¿Cuánto tarda la entrega?",
    answer:
      "Los pedidos se preparan en un plazo de 1 a 2 días hábiles y el envío depende del destino: de 2 a 5 días hábiles en ciudades principales y de 4 a 8 días en el resto del país.",
  },
  {
    question: "¿El envío tiene costo?",
    answer:
      "El envío es gratuito para pedidos iguales o superiores a $200.000 COP. Para pedidos menores el costo de envío es de $12.000 COP.",
  },
  {
    question: "¿Cómo puedo pagar mi pedido?",
    answer:
      "Por el momento aceptamos pago contra entrega y transferencia. Al confirmar la orden recibirás todas las instrucciones por correo.",
  },
  {
    question: "¿Puedo cancelar o modificar una orden?",
    answer: `Sí, siempre que el pedido no haya sido despachado. Escríbenos a ${CONFIG.site.contactEmail} con tu número de orden y lo gestionamos.`,
  },
  {
    question: "¿Qué hago si recibo un producto incorrecto o defectuoso?",
    answer:
      "Contáctanos dentro de los primeros 8 días tras la entrega con fotos del producto y tu número de orden. Coordinaremos el cambio sin costo.",
  },
  {
    question: "¿Cómo sé cuál es mi talla?",
    answer:
      "Cada producto incluye una guía de tallas en su descripción. Si tienes dudas, escríbenos con tus medidas y te asesoramos personalmente.",
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-medium tracking-tight text-brand-dark">Preguntas frecuentes</h1>
        <p className="text-sm text-brand-muted mt-1">
          Todo lo que necesitas saber antes de completar tu compra.
        </p>
      </div>

      <div className="space-y-4">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.question}
            className="group bg-white border border-border/60 rounded-card p-5 open:shadow-subtle transition-shadow"
          >
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-sm font-medium text-brand-dark">
              {item.question}
              <span className="text-brand-muted transition-transform duration-200 group-open:rotate-45" aria-hidden="true">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </span>
            </summary>
            <p className="pt-3 text-sm text-brand-muted leading-relaxed border-t border-border/40 mt-3">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}