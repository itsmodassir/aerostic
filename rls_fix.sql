DO $$ 
DECLARE 
    t text;
    tables_to_secure text[] := ARRAY[
        'anomaly_events', 'api_key_risk_events', 'appointments', 'audit_logs', 
        'contacts', 'domains', 'email_messages', 'email_templates', 
        'invoices', 'mailboxes', 'messages_default', 'messages_y2026m2', 
        'referrals', 'reseller_configs', 'system_configs', 'templates', 
        'tenant_behavior_profiles', 'tenant_daily_metrics', 'tenant_hourly_metrics', 
        'tenant_risk_scores', 'usage_metrics', 'wallet_transactions', 
        'wallet_transactions_2026_02', 'wallet_transactions_2026_03', 
        'wallet_transactions_2026_04', 'wallet_transactions_2026_05', 
        'wallet_transactions_2026_06', 'wallet_transactions_2026_07', 
        'wallet_transactions_2026_08', 'wallet_transactions_2026_09', 
        'wallet_transactions_2026_10', 'wallet_transactions_2026_11', 
        'wallet_transactions_2026_12', 'wallets', 'webhook_endpoints', 
        'whatsapp_accounts', 'workflow_executions', 'workflow_memory'
    ];
BEGIN 
    FOREACH t IN ARRAY tables_to_secure LOOP 
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON %I', t);
        EXECUTE format('CREATE POLICY tenant_isolation_policy ON %I USING (tenant_id = (NULLIF(current_setting($s$app.current_tenant$s$, true), $s$$s$))::uuid)', t);
    END LOOP;

    -- Special case for wallet_accounts
    ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS tenant_isolation_policy ON wallet_accounts;
    CREATE POLICY tenant_isolation_policy ON wallet_accounts USING (
        EXISTS (
            SELECT 1 FROM wallets 
            WHERE wallets.id = wallet_accounts.wallet_id 
            AND wallets.tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid
        )
    );
END $$;
