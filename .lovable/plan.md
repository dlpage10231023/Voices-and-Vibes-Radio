

## Fix Contact Form with Formspree

Replace the `mailto:` logic in `src/components/Contact.tsx` with a Formspree POST submission using the endpoint `https://formspree.io/f/xkoqpynq`.

### Changes: `src/components/Contact.tsx`

1. Replace `handleSubmit` with an async function that POSTs `FormData` to `https://formspree.io/f/xkoqpynq`
2. Add a `status` state (`idle` | `sending` | `success` | `error`) replacing the individual field states
3. Add `name` attributes to inputs (`name`, `email`, `message`) for FormData
4. Disable the submit button while sending, show "Sending..." text
5. Show success message (green) on success, error message (red) with fallback email on failure
6. Reset form on success
7. Keep all existing styling, layout, social links, and section structure exactly as-is

No other files changed.

