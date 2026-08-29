import { PageTitle } from "../../compents/common/PageTitle";

const SECTIONS = [
  {
    title: "1. Aceptación de los términos",
    body: "Al navegar y realizar compras en NOVA aceptas los presentes términos y condiciones. Si no estás de acuerdo con alguno de los puntos aquí descritos, te pedimos no utilizar la plataforma.",
  },
  {
    title: "2. Cuentas de usuario",
    body: "Eres responsable de mantener la confidencialidad de tus credenciales de acceso. También puedes realizar compras como invitado, sin necesidad de crear una cuenta, y hacer seguimiento de tu pedido con el número de orden y tu correo electrónico.",
  },
  {
    title: "3. Precios y disponibilidad",
    body: "Todos los precios se muestran en pesos colombianos (COP) e incluyen los impuestos aplicables. Los precios y la disponibilidad de los productos pueden cambiar sin previo aviso.",
  },
  {
    title: "4. Proceso de compra",
    body: "Este sitio es un entorno de demostración con fines educativos. Ningún pago procesado a través del checkout representa un cobro real; los datos de tarjeta ingresados no se envían a ninguna pasarela de pago externa.",
  },
  {
    title: "5. Envíos",
    body: "Los tiempos y costos de envío se calculan según la dirección de entrega y se muestran claramente antes de confirmar la compra. Consulta la página de Envíos y devoluciones para más detalles.",
  },
  {
    title: "6. Cambios y devoluciones",
    body: "Dispones de 30 días calendario desde la entrega para solicitar un cambio o devolución, siempre que el producto se conserve en las condiciones originales.",
  },
  {
    title: "7. Propiedad intelectual",
    body: "Todo el contenido de este sitio (textos, imágenes, logotipos y diseño) es propiedad de NOVA o de sus respectivos licenciantes y no puede ser reproducido sin autorización previa.",
  },
  {
    title: "8. Contacto",
    body: "Para cualquier duda sobre estos términos, puedes escribirnos a través de la página de Contacto.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <PageTitle
        title="Términos del servicio"
        subtitle="Última actualización: agosto de 2026"
      />

      <div className="space-y-8 rounded-card border border-border/60 bg-white p-6 sm:p-8">
        {SECTIONS.map((section) => (
          <section key={section.title} className="space-y-2">
            <h2 className="text-sm font-semibold text-brand-dark">{section.title}</h2>
            <p className="text-sm leading-relaxed text-brand-muted">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
