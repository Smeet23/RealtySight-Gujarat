import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('developers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('rera_registration_no').unique().notNullable();
    table.string('name').notNullable();
    table.string('company_name');
    table.string('company_type');
    table.text('address');
    table.string('city');
    table.string('state').defaultTo('Gujarat');
    table.string('pincode');
    table.string('email');
    table.string('phone');
    table.string('website');
    table.date('registration_date');
    table.date('registration_expiry');
    table.integer('total_projects').defaultTo(0);
    table.integer('completed_projects').defaultTo(0);
    table.integer('ongoing_projects').defaultTo(0);
    table.decimal('total_investment', 15, 2);
    table.decimal('reliability_score', 3, 2);
    table.jsonb('metadata');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index('rera_registration_no');
    table.index('city');
    table.index('reliability_score');
    table.index('is_active');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('developers');
}