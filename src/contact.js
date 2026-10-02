export const CONTACT_EMAIL = "u.xudoyberdiev@kstu.uz";

export function buildContactMailto({ name, email, message }, translate) {
  const subject = `${translate("emailSubject")}: ${name}`;
  const body = [
    `${translate("senderName")}: ${name}`,
    `${translate("senderEmail")}: ${email}`,
    "",
    message
  ].join("\n");

  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
