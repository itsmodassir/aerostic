ALTER TABLE anomaly_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON anomaly_events;
CREATE POLICY tenant_isolation_policy ON anomaly_events USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE api_key_risk_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON api_key_risk_events;
CREATE POLICY tenant_isolation_policy ON api_key_risk_events USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON appointments;
CREATE POLICY tenant_isolation_policy ON appointments USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON audit_logs;
CREATE POLICY tenant_isolation_policy ON audit_logs USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON contacts;
CREATE POLICY tenant_isolation_policy ON contacts USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON domains;
CREATE POLICY tenant_isolation_policy ON domains USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON email_messages;
CREATE POLICY tenant_isolation_policy ON email_messages USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON email_templates;
CREATE POLICY tenant_isolation_policy ON email_templates USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON invoices;
CREATE POLICY tenant_isolation_policy ON invoices USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE mailboxes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON mailboxes;
CREATE POLICY tenant_isolation_policy ON mailboxes USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE messages_default ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON messages_default;
CREATE POLICY tenant_isolation_policy ON messages_default USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE messages_y2026m2 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON messages_y2026m2;
CREATE POLICY tenant_isolation_policy ON messages_y2026m2 USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON referrals;
CREATE POLICY tenant_isolation_policy ON referrals USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE reseller_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON reseller_configs;
CREATE POLICY tenant_isolation_policy ON reseller_configs USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON system_configs;
CREATE POLICY tenant_isolation_policy ON system_configs USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON templates;
CREATE POLICY tenant_isolation_policy ON templates USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE tenant_behavior_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON tenant_behavior_profiles;
CREATE POLICY tenant_isolation_policy ON tenant_behavior_profiles USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE tenant_daily_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON tenant_daily_metrics;
CREATE POLICY tenant_isolation_policy ON tenant_daily_metrics USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE tenant_hourly_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON tenant_hourly_metrics;
CREATE POLICY tenant_isolation_policy ON tenant_hourly_metrics USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE tenant_risk_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON tenant_risk_scores;
CREATE POLICY tenant_isolation_policy ON tenant_risk_scores USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON usage_metrics;
CREATE POLICY tenant_isolation_policy ON usage_metrics USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON wallet_transactions;
CREATE POLICY tenant_isolation_policy ON wallet_transactions USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE wallet_transactions_2026_02 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON wallet_transactions_2026_02;
CREATE POLICY tenant_isolation_policy ON wallet_transactions_2026_02 USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE wallet_transactions_2026_03 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON wallet_transactions_2026_03;
CREATE POLICY tenant_isolation_policy ON wallet_transactions_2026_03 USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE wallet_transactions_2026_04 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON wallet_transactions_2026_04;
CREATE POLICY tenant_isolation_policy ON wallet_transactions_2026_04 USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE wallet_transactions_2026_05 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON wallet_transactions_2026_05;
CREATE POLICY tenant_isolation_policy ON wallet_transactions_2026_05 USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE wallet_transactions_2026_06 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON wallet_transactions_2026_06;
CREATE POLICY tenant_isolation_policy ON wallet_transactions_2026_06 USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE wallet_transactions_2026_07 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON wallet_transactions_2026_07;
CREATE POLICY tenant_isolation_policy ON wallet_transactions_2026_07 USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE wallet_transactions_2026_08 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON wallet_transactions_2026_08;
CREATE POLICY tenant_isolation_policy ON wallet_transactions_2026_08 USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE wallet_transactions_2026_09 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON wallet_transactions_2026_09;
CREATE POLICY tenant_isolation_policy ON wallet_transactions_2026_09 USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE wallet_transactions_2026_10 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON wallet_transactions_2026_10;
CREATE POLICY tenant_isolation_policy ON wallet_transactions_2026_10 USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE wallet_transactions_2026_11 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON wallet_transactions_2026_11;
CREATE POLICY tenant_isolation_policy ON wallet_transactions_2026_11 USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE wallet_transactions_2026_12 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON wallet_transactions_2026_12;
CREATE POLICY tenant_isolation_policy ON wallet_transactions_2026_12 USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON wallets;
CREATE POLICY tenant_isolation_policy ON wallets USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON webhook_endpoints;
CREATE POLICY tenant_isolation_policy ON webhook_endpoints USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE whatsapp_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON whatsapp_accounts;
CREATE POLICY tenant_isolation_policy ON whatsapp_accounts USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON workflow_executions;
CREATE POLICY tenant_isolation_policy ON workflow_executions USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE workflow_memory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON workflow_memory;
CREATE POLICY tenant_isolation_policy ON workflow_memory USING (tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid);

ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON wallet_accounts;
CREATE POLICY tenant_isolation_policy ON wallet_accounts USING (
    EXISTS (
        SELECT 1 FROM wallets 
        WHERE wallets.id = wallet_accounts.wallet_id 
        AND wallets.tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid
    )
);
