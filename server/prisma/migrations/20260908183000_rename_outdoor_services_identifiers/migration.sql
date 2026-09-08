-- Rename persisted business identifiers after the Pioneer Outdoor Services rebrand.
UPDATE "Expense"
SET "business" = 'outdoor-services'
WHERE "business" = 'landscaping';

UPDATE "FormFile"
SET "businessScope" = 'outdoor-services'
WHERE "businessScope" = 'landscaping';

UPDATE "Setting"
SET "scope" = 'outdoor-services'
WHERE "scope" = 'landscaping';
