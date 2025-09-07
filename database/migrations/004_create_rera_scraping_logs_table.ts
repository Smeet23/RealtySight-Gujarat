import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('rera_scraping_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.timestamp('scrape_started_at').notNullable();
    table.timestamp('scrape_completed_at');
    table.enum('status', ['Running', 'Completed', 'Failed', 'Partial']).notNullable();
    table.enum('scrape_type', ['Full', 'Incremental', 'Specific']).notNullable();
    table.integer('projects_scraped').defaultTo(0);
    table.integer('projects_updated').defaultTo(0);
    table.integer('projects_added').defaultTo(0);
    table.integer('developers_scraped').defaultTo(0);
    table.integer('developers_updated').defaultTo(0);
    table.integer('developers_added').defaultTo(0);
    table.integer('errors_count').defaultTo(0);
    table.jsonb('error_details');
    table.integer('duration_seconds');
    table.jsonb('metadata');
    table.timestamps(true, true);
    
    // Indexes
    table.index('status');
    table.index('scrape_started_at');
    table.index('scrape_type');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('rera_scraping_logs');
}