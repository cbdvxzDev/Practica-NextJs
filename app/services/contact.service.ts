// app/services/contact.service.ts
// Cliente del formulario de contacto.

import { fetcher } from "@/lib/fetcher";
import { CONTACT_TOPICS, type DbContactTopic } from "@/types/db";

export interface ContactFormData {
  name: string;
  email: string;
  topic: DbContactTopic;
  message: string;
  website?: string;
}

export interface ContactResult {
  message: string;
}

export const ContactService = {
  /**
   * Envía un mensaje de contacto.
   *
   * `website` es el campo trampa: vacío en navegadores, relleno por bots.
   */
  async send(data: ContactFormData): Promise<ContactResult> {
    return fetcher<ContactResult>("/api/contact", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

export const CONTACT_TOPIC_OPTIONS: { value: DbContactTopic; label: string }[] = [
  { value: "pedido", label: "Un pedido" },
  { value: "producto", label: "Un producto" },
  { value: "devoluciones", label: "Devoluciones o cambios" },
  { value: "otro", label: "Otro asunto" },
];

export { CONTACT_TOPICS };
