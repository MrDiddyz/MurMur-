#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const { validateNoClaimWithoutEvidence } = require('./clinic_policy');

const ROOT = path.resolve(__dirname, '..');
const schemaPath = path.join(ROOT, 'schemas', 'clinic-ai-knowledge-router.schema.json');
const dataPath = path.join(
  ROOT,
  'knowledge-base',
  'clinic-ai-knowledge-router.sandra-constance.nb-NO.json'
);

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const ajv = new Ajv({ allErrors: true, jsonPointers: true });
const validate = ajv.compile(schema);
const schemaValid = validate(data);
const policyErrors = validateNoClaimWithoutEvidence(data);

if (!schemaValid || policyErrors.length > 0) {
  console.error('Clinic knowledge-router validation failed.');

  if (!schemaValid) {
    console.error('Schema errors:');
    console.error(JSON.stringify(validate.errors, null, 2));
  }

  if (policyErrors.length > 0) {
    console.error('Policy errors:');
    console.error(JSON.stringify(policyErrors, null, 2));
  }

  process.exit(1);
}

console.log('Clinic knowledge-router validation passed.');
