import assert from "node:assert/strict";
import test from "node:test";
import { buildContactMailto, CONTACT_EMAIL } from "./contact.js";

test("builds an encoded mailto link with translated labels", () => {
  const translations = {
    emailSubject: "Portfolio orqali aloqa",
    senderName: "Ism",
    senderEmail: "Email"
  };
  const translate = (key) => translations[key];
  const href = buildContactMailto({
    name: "Ubaydullo & team",
    email: "user+portfolio@example.com",
    message: "Salom,\nLoyiha haqida yozmoqdaman."
  }, translate);
  const parsed = new URL(href);

  assert.equal(parsed.protocol, "mailto:");
  assert.equal(parsed.pathname, CONTACT_EMAIL);
  assert.equal(parsed.searchParams.get("subject"), "Portfolio orqali aloqa: Ubaydullo & team");
  assert.equal(
    parsed.searchParams.get("body"),
    "Ism: Ubaydullo & team\nEmail: user+portfolio@example.com\n\nSalom,\nLoyiha haqida yozmoqdaman."
  );
});

test("keeps Unicode names and messages intact in the mailto payload", () => {
  const translate = (key) => ({
    emailSubject: "Тамос аз портфолио",
    senderName: "Ном",
    senderEmail: "Email"
  })[key];
  const href = buildContactMailto({
    name: "Убайдулло",
    email: "user@example.com",
    message: "Салом — ёрӣ лозим аст."
  }, translate);

  assert.equal(new URL(href).searchParams.get("subject"), "Тамос аз портфолио: Убайдулло");
  assert.match(new URL(href).searchParams.get("body"), /Салом — ёрӣ лозим аст\./);
});
