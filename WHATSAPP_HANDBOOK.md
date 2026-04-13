# 📱 WhatsApp Advanced Features & Coexistence Handbook

Welcome to the Aerostic WhatsApp Integration Guide. This handbook covers high-performance interactive messaging and the "Coexistence" feature built for Meta v25.0 compliance.

---

## 🔗 WhatsApp Business Coexistence

The **WhatsApp Coexistence** feature allows you to use the **WhatsApp Business Mobile App** and the **Aerostic Cloud API** simultaneously on the same phone number.

### 🚀 Onboarding
1.  **Initiate Signup**: Go to Settings > WhatsApp and click "Meta Secure Signup".
2.  **Select Hybrid Mode**: When prompted, choose to connect your **existing** WhatsApp Business account.
3.  **App Version**: Ensure your mobile app is updated to the latest version (v2.24.17+).

### 🔄 Data Synchronization Rules
Aerostic handles your data with intelligent sync guardrails to ensure zero noise:
- **Historical Import**: Upon connection, Aerostic will background-sync up to 6 months of chat history.
  - *Operational Suppression*: Historical messages do **not** trigger unread counts, push notifications, or AI automation.
  - *Chronology*: Messages are inserted into the thread using their original WhatsApp timestamps.
- **Contact Enrichment**: Your mobile app contacts are automatically synced. Aerostic will fill in missing details (like first/last names) but will **never** overwrite manually edited CRM fields.
- **System Events**: Look for the subtle notice: *"Conversation history imported from WhatsApp Business"* to identify the sync boundaries.

---

## ⚡ Interactive Messaging Elements

Aerostic supports rich interactive elements that convert at a 3x higher rate than standard text messages.

### 1. List Menus (`list_message`)
Provide users with a structured selection menu.
- **Use Case**: Frequently Asked Questions, Service Selection, Department Routing.
- **Configuration**: Support for multiple sections and up to 10 rows per interaction.
- **Trigger**: Selection results are captured as `template_reply` events in the Automation Builder.

### 2. WhatsApp Flows (`whatsapp_flow`)
Deploy native, high-conversion forms directly inside the chat.
- **Use Case**: Appointment booking, Lead qualification, Surveys.
- **Response Handling**: When a user submits a Flow, the platform receives a `flow_response`.
- **Logic**: You can map `{{flow.field_name}}` variables directly in the next automation node.

### 3. Smart AI Agents (`ai_agent`)
Leverage Google Gemini-powered agents tailored for WhatsApp.
- **Context-Aware**: Agents understand the full conversation history, including recently imported data.
- **Automation Bridging**: AI Agents can be triggered after a Flow submission or specific keyword detection.

---

## 🤖 Automation & Logic Triggers

To build multi-step campaigns, Aerostic uses specialized trigger detection:

| Trigger Type | Source | Logic Variable |
| :--- | :--- | :--- |
| `new_message` | Standard Text/Media | `{{message.body}}` |
| `flow_response` | WhatsApp Flow Submission | `{{flow[field_id]}}` |
| `template_reply` | List/Button Selection | `{{selection.id}}` |

### 🛠️ Developer & Compliance Note
- **API Baseline**: Meta Graph API **v25.0**.
- **Security**: All webhook events are validated via **HMAC-SHA256** signatures using your `META_APP_SECRET`.
- **Stability**: Integrated deduplication using `meta_message_id` ensures no message is processed twice across the webhook-worker pipeline.

---
*For further support, visit the [Meta Developer Documentation](https://developers.facebook.com/docs/whatsapp) or contact your Aerostic Technical Account Manager.*
