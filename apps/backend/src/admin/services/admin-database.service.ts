
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AdminDatabaseService {
    constructor(private dataSource: DataSource) { }

    async getTables() {
        try {
            // Fetch all tables in the current schema
            const tables = await this.dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);

            return tables.map(t => t.table_name);
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch table list');
        }
    }

    async getTableData(tableName: string, page: number = 1, limit: number = 50) {
        try {
            // Simple validation to prevent SQL injection
            const tables = await this.getTables();
            if (!tables.includes(tableName)) {
                throw new Error('Invalid table name');
            }

            const offset = (page - 1) * limit;

            // Get table columns first
            const columns = await this.dataSource.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `, [tableName]);

            // Get count
            const countRes = await this.dataSource.query(`SELECT COUNT(*) FROM "${tableName}"`);
            const total = parseInt(countRes[0].count);

            // Get data
            const data = await this.dataSource.query(`
        SELECT * FROM "${tableName}" 
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

            return {
                tableName,
                columns,
                data,
                total,
                page,
                limit,
            };
        } catch (error) {
            console.error(`Error fetching data for ${tableName}:`, error);
            throw new InternalServerErrorException(`Failed to fetch data for ${tableName}`);
        }
    }
}
