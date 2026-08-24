import { useEffect } from "react";

export const SITE_URL = "https://danieldetomiartenatureza.com";
export const SITE_NAME = "Atelier Daniel Detomi - Arte e Natureza";
export const DEFAULT_IMAGE = "/images/real-tiradentes-panel.jpg";

type JsonLd = Record<string, unknown> | Record<string, unknown>[];

type SeoConfig = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
  type?: "website" | "article" | "profile";
  jsonLd?: JsonLd;
  noindex?: boolean;
};

export const baseKeywords = [
  "Daniel Detomi",
  "Atelier Daniel Detomi",
  "Atelie de arte em Tiradentes",
  "Atelier em Tiradentes",
  "Artista em Tiradentes",
  "Artista plastico em Tiradentes",
  "Arte brasileira",
  "Arte contemporanea",
  "Arte e natureza",
  "Galeria de arte em Tiradentes",
  "Galeria de arte em Minas Gerais",
  "Turismo cultural em Tiradentes",
];

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

function setJsonLd(jsonLd?: JsonLd) {
  const id = "page-json-ld";
  document.getElementById(id)?.remove();
  if (!jsonLd) return;

  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(jsonLd);
  document.head.appendChild(script);
}

export function usePageSeo({
  title,
  description,
  path = typeof window === "undefined" ? "/" : window.location.pathname,
  image = DEFAULT_IMAGE,
  keywords = [],
  type = "website",
  jsonLd,
  noindex = false,
}: SeoConfig) {
  useEffect(() => {
    const canonical = absoluteUrl(path);
    const imageUrl = absoluteUrl(image);
    const fullTitle = title.includes("Daniel Detomi") ? title : `${title} | ${SITE_NAME}`;
    const uniqueKeywords = Array.from(new Set([...keywords, ...baseKeywords]));

    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("name", "keywords", uniqueKeywords.join(", "));
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    setMeta("name", "author", "Daniel Detomi");
    setMeta("name", "geo.region", "BR-MG");
    setMeta("name", "geo.placename", "Tiradentes, Minas Gerais");
    setMeta("name", "geo.position", "-21.0955636;-44.1325055");
    setMeta("name", "ICBM", "-21.0955636, -44.1325055");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:image", imageUrl);
    setMeta("property", "og:locale", "pt_BR");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", imageUrl);
    setLink("canonical", canonical);
    setJsonLd(jsonLd);
  }, [description, image, jsonLd, keywords, noindex, path, title, type]);
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ArtGallery",
  "@id": `${SITE_URL}/#atelier`,
  name: "Atelier Daniel Detomi",
  alternateName: "Atelier Daniel Detomi - Arte e Natureza",
  url: SITE_URL,
  image: absoluteUrl(DEFAULT_IMAGE),
  description:
    "Atelie de arte em Tiradentes, Minas Gerais, com pinturas, esculturas, papel mache, recortes em metal de reuso e galeria a ceu aberto inspirada na fauna e flora brasileira.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Estrada de Tiradentes, perto do Museu do Automovel da Estrada Real",
    addressLocality: "Tiradentes",
    addressRegion: "MG",
    addressCountry: "BR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -21.0955636,
    longitude: -44.1325055,
  },
  founder: {
    "@type": "Person",
    "@id": `${SITE_URL}/artista#daniel-detomi`,
    name: "Daniel Detomi",
    jobTitle: "Artista plastico",
  },
  sameAs: ["https://www.instagram.com/danieldetomiartenatureza"],
};
