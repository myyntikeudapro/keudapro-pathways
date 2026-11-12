import { trackEvent } from "./analytics";

export function trackPksAction(action: "contact_open" | "message_copy" | "answer_feedback", value: "success" | "failed" | "helpful" | "unhelpful" | "employment_contact") {
  trackEvent(`pks_${action}`, { service: "tyonhakijan-yksilovalmennus-pks", value });
}