const { Prisma } = require('@prisma/client');

const MAX_DECIMAL_12_2 = new Prisma.Decimal('9999999999.99');

function parsePositiveDecimal(value, fieldName) {
  let decimal;
  try {
    decimal = new Prisma.Decimal(value);
  } catch {
    throw new Error(`${fieldName} must be a valid decimal`);
  }

  if (!decimal.isFinite() || decimal.lte(0) || decimal.decimalPlaces() > 2 || decimal.gt(MAX_DECIMAL_12_2)) {
    throw new Error(`${fieldName} must be a positive decimal with at most 2 decimal places`);
  }
  return decimal;
}

module.exports = { parsePositiveDecimal, MAX_DECIMAL_12_2 };
