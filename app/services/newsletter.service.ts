// app/services/newsletter.service.ts
// Cliente del alta en la lista de la carta.

import { fetcher } from "@/lib/fetcher";

export interface SubscribeResult {
  message: string;
  alreadySubscribed: boolean;
}

export const NewsletterService = {
  /**
   * Da de alta un correo en la lista.
   *
   * `website` es el campo trampa: los navegadores lo dejan vacío, así que solo
   * se manda para que el servidor pueda descartar bots.
   */
  async subscribe(email: string, website = ""): Promise<SubscribeResult> {
    return fetcher<SubscribeResult>("/api/newsletter", {
      method: "POST",
      body: JSON.stringify({ email, website }),
    });
  },
};
