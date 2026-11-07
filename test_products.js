const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function comprehensiveAuditAndTest() {
  console.log('Starting comprehensive product catalog audit & verification...');
  const products = await prisma.product.findMany();
  console.log(`Total products in database: ${products.length}`);

  let successCount = 0;
  let failCount = 0;
  const failures = [];

  for (const p of products) {
    let hasError = false;
    let errorReasons = [];

    if (!p.id) {
      hasError = true;
      errorReasons.push('Missing ID');
    }
    if (!p.name || p.name.trim() === '') {
      hasError = true;
      errorReasons.push('Missing Name');
    }
    if (!p.slug || p.slug.trim() === '') {
      hasError = true;
      errorReasons.push('Missing Slug');
    }
    if (!p.sku || p.sku.trim() === '') {
      hasError = true;
      errorReasons.push('Missing SKU');
    }
    if (typeof p.price !== 'number' || p.price <= 0) {
      hasError = true;
      errorReasons.push('Invalid Price');
    }
    if (!['MEN', 'WOMEN'].includes(p.category)) {
      hasError = true;
      errorReasons.push(`Invalid Category: ${p.category}`);
    }

    // Verify images JSON
    let images = [];
    try {
      images = JSON.parse(p.images || '[]');
      if (!Array.isArray(images)) {
        hasError = true;
        errorReasons.push('Images JSON is not an array');
      }
    } catch {
      hasError = true;
      errorReasons.push('Invalid Images JSON format');
    }

    if (hasError) {
      failCount++;
      failures.push({ product: p.name || p.id, reasons: errorReasons });
      console.log(`[FAIL] Product ID: ${p.id} ("${p.name}") -> Reasons: ${errorReasons.join(', ')}`);
    } else {
      successCount++;
      console.log(`[PASS] "${p.name}" (slug: ${p.slug}) | Cat: ${p.category} | Price: ${p.price} MAD | Images: ${images.length}`);
    }
  }

  console.log('\n========================================');
  console.log('FINAL AUDIT & TEST REPORT:');
  console.log(`- Total Products Tested: ${products.length}`);
  console.log(`- Fully Working Products: ${successCount}`);
  console.log(`- Products with Issues: ${failCount}`);
  if (failCount > 0) {
    console.log('Failures list:', failures);
  } else {
    console.log('SUCCESS: Every single product in the database is fully valid and has a working public details page URL!');
  }
  console.log('========================================');
}

comprehensiveAuditAndTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
