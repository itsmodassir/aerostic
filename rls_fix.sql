DO $$ 
DECLARE 
    t text;
BEGIN 
    -- Dynamically find all tables that have a 'tenant_id' column
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'tenant_id' 
        AND table_schema = 'public'
        AND table_name != 'tenants' -- Don't secure the tenants table itself with this specific policy if it contains the source of truth
    LOOP 
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON %I', t);
        EXECUTE format('CREATE POLICY tenant_isolation_policy ON %I USING (tenant_id = (NULLIF(current_setting($$app.current_tenant$$, true), $$$$))::uuid)', t);
        RAISE NOTICE 'Secured table: %', t;
    END LOOP;

    -- Special case for wallet_accounts (secured via relation to wallets)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallet_accounts') THEN
        ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS tenant_isolation_policy ON wallet_accounts;
        CREATE POLICY tenant_isolation_policy ON wallet_accounts USING (
            EXISTS (
                SELECT 1 FROM wallets 
                WHERE wallets.id = wallet_accounts.wallet_id 
                AND wallets.tenant_id = (NULLIF(current_setting('app.current_tenant', true), ''))::uuid
            )
        );
        RAISE NOTICE 'Secured table: wallet_accounts (via relation)';
    END IF;
END $$;
