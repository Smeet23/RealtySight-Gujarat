import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('market_analytics', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('city').notNullable();
    table.string('locality');
    table.date('analysis_date').notNullable();
    table.enum('period_type', ['Daily', 'Weekly', 'Monthly', 'Quarterly']).notNullable();
    
    // Market metrics
    table.integer('total_projects');
    table.integer('new_launches');
    table.integer('completed_projects');
    table.integer('total_inventory');
    table.integer('units_sold');
    table.decimal('absorption_rate', 5, 2);
    
    // Pricing metrics
    table.decimal('avg_price_per_sqft', 10, 2);
    table.decimal('price_change_percentage', 5, 2);
    table.decimal('min_price_per_sqft', 10, 2);
    table.decimal('max_price_per_sqft', 10, 2);
    
    // Demand indicators
    table.decimal('demand_index', 5, 2);
    table.decimal('supply_index', 5, 2);
    table.decimal('market_sentiment_score', 3, 2);
    
    // Competition metrics
    table.jsonb('top_developers'); // [{name: "ABC", market_share: 15.5, projects: 10}]
    table.jsonb('price_distribution'); // {below_5k: 20, 5k_10k: 40, above_10k: 40}
    table.jsonb('unit_type_distribution'); // {1BHK: 30, 2BHK: 45, 3BHK: 25}
    
    // Predictions
    table.decimal('predicted_price_next_quarter', 10, 2);
    table.decimal('predicted_absorption_rate', 5, 2);
    table.decimal('investment_score', 3, 2);
    
    // Metadata
    table.jsonb('metadata');
    table.timestamps(true, true);
    
    // Indexes
    table.index('city');
    table.index('locality');
    table.index('analysis_date');
    table.index('period_type');
    table.index(['city', 'analysis_date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('market_analytics');
}