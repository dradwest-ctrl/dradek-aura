const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanTemporaryFiles() {
  const fs = require('fs');
  const path = require('path');
  const filesToDelete = ['list_products.js', 'fix_slugs.js', 'fix_images.js'];
  for (const f of filesToDelete) {
    const filePath = path.join(__dirname, f);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted temporary script: ${f}`);
    }
  }
}

cleanTemporaryFiles().catch(console.error);
