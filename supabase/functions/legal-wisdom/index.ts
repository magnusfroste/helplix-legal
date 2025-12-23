import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WisdomRequest {
  country?: string;
  category?: "quote" | "principle" | "proverb" | "fact";
}

// Legal wisdom by country
const legalWisdom: Record<string, Record<string, string[]>> = {
  BR: {
    quote: [
      "A justiça atrasada não é justiça, é injustiça qualificada e manifesta. - Rui Barbosa",
      "O direito é a ciência do bom e do justo. - Ulpiano",
      "Onde não há lei, não há liberdade. - John Locke",
    ],
    principle: [
      "Princípio da Dignidade da Pessoa Humana - Base da Constituição Federal de 1988",
      "Princípio da Legalidade - Ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei",
      "Princípio do Contraditório e Ampla Defesa - Garantia constitucional no processo",
    ],
    proverb: [
      "Dura lex, sed lex - A lei é dura, mas é a lei",
      "Ignorantia legis neminem excusat - A ignorância da lei não desculpa ninguém",
      "Pacta sunt servanda - Os pactos devem ser cumpridos",
    ],
    fact: [
      "O Brasil adotou o sistema jurídico de Civil Law, baseado em códigos escritos",
      "A Constituição Federal de 1988 é conhecida como 'Constituição Cidadã'",
      "O Código Civil Brasileiro atual entrou em vigor em 2003, substituindo o código de 1916",
    ],
  },
  MX: {
    quote: [
      "Entre los individuos, como entre las naciones, el respeto al derecho ajeno es la paz. - Benito Juárez",
      "La justicia es la reina de las virtudes republicanas. - Simón Bolívar",
      "El derecho es el conjunto de condiciones que permiten a la libertad de cada uno acomodarse a la libertad de todos. - Immanuel Kant",
    ],
    principle: [
      "Principio de Legalidad - Nadie puede ser obligado a hacer lo que la ley no manda",
      "Garantía de Audiencia - Nadie puede ser privado de sus derechos sin ser oído",
      "Principio Pro Persona - Interpretación más favorable a la persona",
    ],
    proverb: [
      "Dura lex, sed lex - La ley es dura, pero es la ley",
      "Nullum crimen sine lege - No hay crimen sin ley previa",
      "In dubio pro reo - En caso de duda, a favor del acusado",
    ],
    fact: [
      "México tiene un sistema jurídico mixto que combina Civil Law y Common Law",
      "La Constitución Mexicana de 1917 fue una de las primeras en incluir derechos sociales",
      "El Amparo es un recurso legal único en México para proteger derechos constitucionales",
    ],
  },
  SE: {
    quote: [
      "Rättvisa är grunden för ett samhälle. - Tage Erlander",
      "Lagen är till för människorna, inte människorna för lagen. - Svensk rättsprincip",
      "Lika inför lagen - Grundläggande svensk princip",
    ],
    principle: [
      "Legalitetsprincipen - Ingen får dömas för gärning som inte var straffbar när den begicks",
      "Offentlighetsprincipen - Allmänna handlingar ska vara tillgängliga för alla",
      "Objektivitetsprincipen - Myndigheter ska vara objektiva och opartiska",
    ],
    proverb: [
      "Okunnighet om lagen ursäktar ingen - Ignorantia juris non excusat",
      "Lika lön för lika arbete - Grundläggande arbetsrättsprincip",
      "Oskyldig till motsatsen bevisats - In dubio pro reo",
    ],
    fact: [
      "Sverige har ett av världens äldsta tryckfrihetsförordningar från 1766",
      "Allemansrätten är en unik svensk rättighet att vistas i naturen",
      "Sveriges rättssystem bygger på Civil Law med skandinavisk prägel",
    ],
  },
  US: {
    quote: [
      "Equal justice under law. - US Supreme Court motto",
      "Justice delayed is justice denied. - William E. Gladstone",
      "The law is reason, free from passion. - Aristotle",
    ],
    principle: [
      "Due Process - No person shall be deprived of life, liberty, or property without due process",
      "Equal Protection - All persons are entitled to equal protection under the law",
      "Presumption of Innocence - Innocent until proven guilty beyond reasonable doubt",
    ],
    proverb: [
      "Ignorance of the law is no excuse - Ignorantia juris non excusat",
      "Justice is blind - Equal treatment regardless of status",
      "A man's home is his castle - Protection of private property",
    ],
    fact: [
      "The US has a Common Law system based on judicial precedents",
      "The Constitution is the supreme law of the land, adopted in 1787",
      "The Bill of Rights (first 10 amendments) protects fundamental freedoms",
    ],
  },
  DO: {
    quote: [
      "La justicia es la base de la paz social. - Principio dominicano",
      "El derecho es la voluntad constante y perpetua de dar a cada uno lo suyo. - Ulpiano",
      "Donde hay derecho, hay remedio. - Legal maxim",
    ],
    principle: [
      "Principio de Legalidad - Nadie puede ser juzgado sino conforme a leyes preexistentes",
      "Derecho a la Defensa - Toda persona tiene derecho a ser oída",
      "Igualdad ante la Ley - Todos son iguales ante la ley",
    ],
    proverb: [
      "La ley es igual para todos - Equality before the law",
      "Nadie está por encima de la ley - No one is above the law",
      "Pacta sunt servanda - Los contratos deben cumplirse",
    ],
    fact: [
      "República Dominicana tiene un sistema de Civil Law basado en el código napoleónico",
      "La Constitución actual fue promulgada en 2010",
      "El sistema judicial dominicano se divide en jurisdicción ordinaria y constitucional",
    ],
  },
  NL: {
    quote: [
      "Recht is wat recht doet. - Nederlandse spreuk",
      "Gelijkheid voor de wet is de basis van rechtvaardigheid. - Nederlands principe",
      "De wet is er voor de burger, niet andersom. - Rechtsstaat principe",
    ],
    principle: [
      "Legaliteitsbeginsel - Geen straf zonder voorafgaande wettelijke strafbepaling",
      "Onschuldpresumptie - Onschuldig tot het tegendeel bewezen is",
      "Hoor en wederhoor - Beide partijen moeten gehoord worden",
    ],
    proverb: [
      "Onbekendheid met de wet verschoont niet - Ignorantia juris non excusat",
      "Gelijke monniken, gelijke kappen - Gelijke behandeling voor iedereen",
      "Wie zijn billen brandt, moet op de blaren zitten - Eigen verantwoordelijkheid",
    ],
    fact: [
      "Nederland heeft een Civil Law systeem gebaseerd op het Burgerlijk Wetboek",
      "De Nederlandse Grondwet dateert van 1815 en is meerdere keren herzien",
      "Nederland staat bekend om zijn pragmatische benadering van rechtspraak",
    ],
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { country = "SE", category = "quote" } = await req.json() as WisdomRequest;

    console.log("Generating legal wisdom for:", country, category);

    const countryWisdom = legalWisdom[country] || legalWisdom["SE"];
    const categoryWisdom = countryWisdom[category] || countryWisdom["quote"];
    
    // Select random wisdom
    const randomIndex = Math.floor(Math.random() * categoryWisdom.length);
    const wisdom = categoryWisdom[randomIndex];

    // Get all wisdom for this country
    const allWisdom = {
      country,
      category,
      wisdom,
      allCategories: {
        quotes: countryWisdom.quote.length,
        principles: countryWisdom.principle.length,
        proverbs: countryWisdom.proverb.length,
        facts: countryWisdom.fact.length,
      },
    };

    return new Response(
      JSON.stringify(allWisdom),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Legal wisdom error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
