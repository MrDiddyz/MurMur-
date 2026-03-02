#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

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
const valid = validate(data);

if (!valid) {
  console.error('Clinic knowledge-router validation failed.');
  console.error(JSON.stringify(validate.errors, null, 2));
  process.exit(1);
}

console.log('Clinic knowledge-router validation passed.');
