-- Certificates v1.1: upfront-interest payout frequency (display/calculation only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
    WHERE pg_type.typname = 'certificate_payout_frequency'
      AND pg_enum.enumlabel = 'instantly'
  ) THEN
    ALTER TYPE public.certificate_payout_frequency ADD VALUE 'instantly';
  END IF;
END $$;
