-- Script to pre-create partitions for messages and wallet_transactions
DO $$ 
DECLARE 
    current_yr int := EXTRACT(YEAR FROM CURRENT_DATE);
    current_mo int := EXTRACT(MONTH FROM CURRENT_DATE);
    next_yr int;
    next_mo int;
    partition_name text;
    start_date text;
    end_date text;
BEGIN
    -- Loop for current and next 2 months
    FOR i IN 0..2 LOOP
        next_mo := current_mo + i;
        next_yr := current_yr;
        
        IF next_mo > 12 THEN
            next_mo := next_mo - 12;
            next_yr := next_yr + 1;
        END IF;

        start_date := format('%s-%s-01', next_yr, lpad(next_mo::text, 2, '0'));
        
        -- Calculate end date (first day of following month)
        IF next_mo = 12 THEN
            end_date := format('%s-01-01', next_yr + 1);
        ELSE
            end_date := format('%s-%s-01', next_yr, lpad((next_mo + 1)::text, 2, '0'));
        END IF;

        -- 1. Messages Partition
        partition_name := format('messages_y%sm%s', next_yr, next_mo);
        IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = partition_name) THEN
            EXECUTE format('CREATE TABLE %I PARTITION OF messages FOR VALUES FROM (%L) TO (%L)', partition_name, start_date, end_date);
            RAISE NOTICE 'Created partition: %', partition_name;
        END IF;

        -- 2. Wallet Transactions Partition
        partition_name := format('wallet_transactions_%s_%s', next_yr, lpad(next_mo::text, 2, '0'));
        IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = partition_name) THEN
            EXECUTE format('CREATE TABLE %I PARTITION OF wallet_transactions FOR VALUES FROM (%L) TO (%L)', partition_name, start_date, end_date);
            RAISE NOTICE 'Created partition: %', partition_name;
        END IF;
    END LOOP;
END $$;
