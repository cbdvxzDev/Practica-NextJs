import { PageTitle } from "../../compents/common/PageTitle";

const SECTIONS = [
  {
    title: "1. Información que recopilamos",
    body: "Recopilamos los datos que nos proporcionas directamente al crear una cuenta o realizar una compra: nombre, correo electrónico, teléfono, dirección de envío y, en el caso de los pagos, información de la tarjeta usada exclusivamente para procesar la transacción. Este es un entorno de práctica: no se realiza ningún cobro real ni se almacenan datos de tarjetas en servidores externos.",
  },
  {
    title: "2. Uso de la información",
    body: "Usamos tus datos para procesar pedidos, gestionar tu cuenta, brindarte soporte y comunicarte novedades sobre tus compras. No vendemos ni compartimos tu información personal con terceros con fines comerciales.",
  },
  {
    title: "3. Almacenamiento y seguridad",
    body: "En esta plataforma de demostración, la información de tu cuenta, carrito y pedidos se guarda localmente en tu navegador. No se transmite a servidores externos ni se comparte con terceros.",
  },
  {
    title: "4. Cookies y tecnologías similares",
    body: "Utilizamos almacenamiento local del navegador para mantener tu sesión iniciada, recordar los productos de tu carrito y tus preferencias de navegación. Puedes borrar esta información en cualquier momento desde la configuración de tu navegador.",
  },
  {
    title: "5. Tus derechos",
    body: "Puedes solicitar en cualquier momento la actualización o eliminación de tus datos personales escribiéndonos a través de la página de Contacto.",
  },
  {
    title: "6. Cambios a esta política",
    body: "Podemos actualizar esta política de privacidad periódicamente. Cualquier cambio será publicado en esta misma página con la fecha de última actualización.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <PageTitle
        title="Política de privacidad"
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
