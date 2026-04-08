import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('--- Flows Table Check ---');
    const flowsResult = await dataSource.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'automation_flows';
    `);
    const existingFlowsCols = flowsResult.map((r: any) => r.column_name);
    const missingFlowsCols = ['remote_id', 'categories', 'endpoint_uri', 'is_endpoint_enabled'];
    const flowsToAdd = missingFlowsCols.filter(c => !existingFlowsCols.includes(c));

    if (flowsToAdd.length > 0) {
      console.log('Adding missing columns to flows:', flowsToAdd);
      for (const col of flowsToAdd) {
        if (col === 'categories') {
          await dataSource.query(`ALTER TABLE automation_flows ADD COLUMN categories jsonb DEFAULT '[]'`);
        } else if (col === 'is_endpoint_enabled') {
          await dataSource.query(`ALTER TABLE automation_flows ADD COLUMN is_endpoint_enabled boolean DEFAULT false`);
        } else {
          await dataSource.query(`ALTER TABLE automation_flows ADD COLUMN ${col} text`);
        }
      }
      console.log('Flows migration complete!');
    } else {
      console.log('Flows table is up to date.');
    }

    // --- Contacts Table Fix ---
    console.log('--- Contacts Table Check ---');
    const contactsResult = await dataSource.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'contacts';
    `);
    const existingContactsCols = contactsResult.map((r: any) => r.column_name);
    const missingContactsCols = ['country_code', 'is_vip', 'groups'];
    const contactsToAdd = missingContactsCols.filter(c => !existingContactsCols.includes(c));

    if (contactsToAdd.length > 0) {
      console.log('Adding missing columns to contacts:', contactsToAdd);
      for (const col of contactsToAdd) {
        if (col === 'groups') {
          await dataSource.query(`ALTER TABLE contacts ADD COLUMN groups jsonb DEFAULT '[]'`);
        } else if (col === 'is_vip') {
          await dataSource.query(`ALTER TABLE contacts ADD COLUMN is_vip boolean DEFAULT false`);
        } else {
          await dataSource.query(`ALTER TABLE contacts ADD COLUMN ${col} text`);
        }
      }
      console.log('Contacts migration complete!');
    } else {
      console.log('Contacts table is up to date.');
    }

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await app.close();
  }
}

bootstrap();
