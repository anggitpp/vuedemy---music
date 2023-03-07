import { createI18n } from "vue-i18n";
import en from "@/locales/en.json";
import id from "@/locales/id.json";

export default createI18n({
  locale: "id",
  fallbackLocale: "id",
  messages: {
    en,
    id,
  },
  numberFormats: {
    en: {
      currency: {
        style: "currency",
        currency: "USD",
        currencyDisplay: "symbol",
      },
    },
    id: {
      currency: {
        style: "currency",
        currency: "IDR",
        currencyDisplay: "symbol",
      },
    },
  },
});
