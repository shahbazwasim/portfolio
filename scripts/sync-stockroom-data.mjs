/**
 * Copies the summary exports of the open-source commerce-analytics-dbt project
 * into the Stockroom demo, trimmed to what the dashboard renders.
 *
 *   node scripts/sync-stockroom-data.mjs [path/to/commerce-analytics-dbt/exports]
 *
 * Every figure in the demo comes from this file, so re-run it after a dbt
 * build instead of editing numbers by hand.
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const SOURCE = process.argv[2] ?? '../commerce-analytics-dbt/exports'
const TARGET = 'src/demos/stockroom/data.json'

const read = async (file) => JSON.parse(await readFile(path.join(SOURCE, file), 'utf8'))

const [kpis, monthly, cohorts, rfm, products, quality] = await Promise.all([
  read('kpis.json'),
  read('monthly_revenue.json'),
  read('cohort_retention.json'),
  read('rfm_segments.json'),
  read('top_products.json'),
  read('data_quality.json'),
])

const data = {
  source: kpis.meta.source,
  window: kpis.meta.data_window,
  kpis: {
    netRevenue: kpis.revenue.net_revenue,
    returnRateByValue: kpis.revenue.return_rate_by_value,
    averageOrderValue: kpis.revenue.average_order_value,
    guestShareOfRevenue: kpis.revenue.guest_share_of_net_revenue,
    topCountry: kpis.revenue.top_country,
    topCountryShare: kpis.revenue.top_country_share_of_net_revenue,
    purchaseOrders: kpis.volume.purchase_orders,
    countries: kpis.volume.countries,
    customers: kpis.customers.customers,
    repeatCustomerRate: kpis.customers.repeat_customer_rate,
  },
  months: monthly.months.map((m) => ({
    month: m.month,
    netRevenue: m.net_revenue,
    orders: m.orders,
    averageOrderValue: m.average_order_value,
    partial: m.is_partial_month,
  })),
  cohorts: cohorts.cohorts.map((c) => ({
    month: c.cohort_month,
    size: c.cohort_size,
    retention: c.retention_rate,
  })),
  segments: rfm.segments.map((s) => ({
    segment: s.segment,
    description: s.description,
    customers: s.customers,
    shareOfCustomers: s.share_of_customers,
    shareOfRevenue: s.share_of_revenue,
  })),
  products: products.products.slice(0, 10).map((p) => ({
    rank: p.rank,
    description: p.description,
    netRevenue: p.net_revenue,
    unitsSold: p.units_sold,
    returnRate: p.return_rate,
  })),
  quality: quality.checks.map((c) => ({
    check: c.check,
    description: c.description,
    treatment: c.treatment,
    rows: c.affected_rows,
    share: c.share_of_source_rows,
  })),
}

await writeFile(TARGET, `${JSON.stringify(data, null, 1)}\n`)
console.log(`Wrote ${TARGET} from ${SOURCE}`)
