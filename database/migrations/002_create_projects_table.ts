import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('projects', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('rera_project_id').unique().notNullable();
    table.uuid('developer_id').references('id').inTable('developers').onDelete('CASCADE');
    table.string('project_name').notNullable();
    table.text('project_description');
    table.enum('project_type', ['Residential', 'Commercial', 'Mixed', 'Plotted']).notNullable();
    table.enum('project_status', ['New', 'Ongoing', 'Completed', 'Delayed', 'Stalled']);
    
    // Location details
    table.text('address');
    table.string('locality');
    table.string('city').notNullable();
    table.string('district');
    table.string('pincode');
    table.decimal('latitude', 10, 8);
    table.decimal('longitude', 11, 8);
    
    // Project details
    table.decimal('total_area_sqmt', 12, 2);
    table.integer('total_units');
    table.integer('total_buildings');
    table.integer('total_floors');
    table.jsonb('unit_configurations'); // {1BHK: 100, 2BHK: 150, etc}
    
    // Pricing
    table.decimal('min_price', 12, 2);
    table.decimal('max_price', 12, 2);
    table.decimal('avg_price_per_sqft', 10, 2);
    
    // Booking status
    table.integer('units_sold').defaultTo(0);
    table.integer('units_available');
    table.decimal('booking_percentage', 5, 2);
    table.date('last_booking_update');
    
    // Timeline
    table.date('project_start_date');
    table.date('project_completion_date');
    table.date('revised_completion_date');
    table.date('actual_completion_date');
    
    // Financial
    table.decimal('total_project_cost', 15, 2);
    table.decimal('amount_collected', 15, 2);
    
    // Approvals
    table.jsonb('approvals'); // {land_use: true, environment: false, etc}
    table.date('rera_approval_date');
    table.date('rera_expiry_date');
    
    // Amenities
    table.jsonb('amenities'); // ["Swimming Pool", "Gym", "Club House", etc]
    
    // Analytics
    table.integer('views_count').defaultTo(0);
    table.integer('inquiries_count').defaultTo(0);
    table.decimal('demand_score', 3, 2);
    table.decimal('investment_score', 3, 2);
    
    // Metadata
    table.jsonb('quarterly_sales'); // [{quarter: "Q1-2024", units: 25, revenue: 10000000}]
    table.jsonb('metadata');
    table.boolean('is_featured').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Indexes
    table.index('rera_project_id');
    table.index('developer_id');
    table.index('city');
    table.index('locality');
    table.index('project_status');
    table.index('project_type');
    table.index('booking_percentage');
    table.index('is_active');
    table.index(['latitude', 'longitude']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('projects');
}