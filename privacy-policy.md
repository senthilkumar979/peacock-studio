# Peacock privacy policy

Last updated: `{{DATE}}`

This privacy policy explains how Peacock handles information when you use the Peacock browser extension and related web app.

Replace all `{{...}}` placeholders before publishing.

## 1. Who we are

Peacock is provided by:

- Company / publisher: `{{COMPANY_NAME}}`
- Website: `{{WEBSITE_URL}}`
- Contact email: `{{SUPPORT_EMAIL}}`

## 2. What Peacock does

Peacock helps users record browser workflows and turn them into step-by-step documentation with screenshots.

Depending on the product version you are using, Peacock may:

- capture screenshots of pages the user is documenting
- capture step metadata such as page URL, page title, and interaction context
- store generated documentation locally in the browser
- allow users to open, edit, export, compare, and share saved documentation

## 3. Information Peacock processes

Peacock may process the following categories of information while the user is actively recording a workflow:

- page URLs
- page titles
- screenshots of the page being documented
- recorded interaction metadata such as clicks, typed field context, or navigation events
- documentation metadata such as flow titles, descriptions, and generated timestamps

Important:

- Peacock is designed to record what the user is documenting.
- If the recorded page contains personal, sensitive, or confidential information, that information may appear in screenshots or recorded step context unless it is masked or excluded.

## 4. How information is used

Peacock uses this information to:

- create step-by-step documentation from recorded workflows
- show screenshots and step context in the editor and player
- export documentation to formats such as PDF
- support comparison and playback features
- improve the quality and usability of recorded flows

## 5. Local storage behavior

At the time of writing, Peacock is designed to store saved documentation and screenshots locally in the browser by default.

This means recorded content may be stored in browser-managed local storage technologies such as IndexedDB on the user’s device.

If your production deployment later adds server-side syncing, cloud sharing, analytics, crash reporting, or any remote persistence, update this policy before publishing.

## 6. Data sharing

Current intended policy template:

- Peacock does **not** sell personal information.
- Peacock does **not** share recorded documentation content with third parties except when necessary to provide a feature explicitly requested by the user or when required by law.

If this is not true in your production setup, replace this section with the correct statement.

## 7. Data transmission

If Peacock sends data over the network, it should be transmitted over secure channels such as HTTPS.

If recorded content never leaves the browser in your released version, state that clearly in your final published version of this policy.

## 8. Data retention

Peacock stores documentation for as long as it remains saved in the browser or product environment chosen by the user, unless:

- the user deletes the documentation
- the browser clears local storage
- the product introduces account-based storage retention rules

If your hosted version syncs data remotely, add the exact retention period here.

## 9. User controls

Users can generally control their data by:

- deleting saved documentation from the product
- clearing browser storage
- uninstalling the extension
- contacting `{{SUPPORT_EMAIL}}` for privacy-related questions

If you provide account-based deletion, export, or access workflows, describe them here.

## 10. Permissions explanation

Peacock may request browser permissions such as:

- `activeTab`
- `tabs`
- `scripting`
- `storage`
- `clipboardWrite`
- host access to pages the user chooses to document

These permissions are used to:

- capture and structure documentation steps
- inject the recorder where needed
- store local recordings and screenshots
- support copy/share functionality

## 11. Children’s privacy

Peacock is not intended for children under the age of `{{MINIMUM_AGE_OR_REGION_STANDARD}}`, and we do not knowingly collect personal information from children.

## 12. Changes to this policy

We may update this privacy policy from time to time. When we do, we will update the “Last updated” date above.

## 13. Contact

For privacy questions or requests, contact:

- Email: `{{SUPPORT_EMAIL}}`
- Website: `{{WEBSITE_URL}}`
