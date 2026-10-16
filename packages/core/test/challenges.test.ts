import { describe, expect, it } from "vitest";
import { challengeName, parseChallenge } from "../src/domain/challenges";

const challengeNote = `---
type: challenge
---

#java #reto

# Reto — Agenda de contactos

> [!info] Contexto

Una agenda por consola: añadir y buscar contactos. Al salir, los datos persisten en JSON.

## Qué pondrás a prueba

[[Dominio — POO|POO]], [[Dominio — Ficheros|persistencia JSON]].

## Requisitos

- [x] Clase Contacto con encapsulación
- [ ] Persistencia en JSON
- [ ] Eliminar pidiendo confirmación

## Para GitHub

Repo propio con [[README]].
`;

describe("parseChallenge", () => {
  it("reads the summary, the requirements and the topics it tests", () => {
    expect(parseChallenge(challengeNote)).toEqual({
      summary: "Una agenda por consola: añadir y buscar contactos.",
      requirements: { done: 1, total: 3 },
      tests: ["Dominio — POO", "Dominio — Ficheros"],
    });
  });

  it("works with an empty note", () => {
    expect(parseChallenge("")).toEqual({
      summary: "",
      requirements: { done: 0, total: 0 },
      tests: [],
    });
  });
});

describe("challengeName", () => {
  it("splits the number and the title", () => {
    expect(challengeName("Reto 03 — Analizador de texto")).toEqual({
      number: "03",
      title: "Analizador de texto",
    });
    expect(challengeName("Mi proyecto")).toEqual({ title: "Mi proyecto" });
  });
});
