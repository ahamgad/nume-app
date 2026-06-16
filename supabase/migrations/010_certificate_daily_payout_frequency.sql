-- Add daily interest payout frequency for certificates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
    WHERE pg_type.typname = 'certificate_payout_frequency'
      AND pg_enum.enumlabel = 'daily'
  ) THEN
    ALTER TYPE public.certificate_payout_frequency ADD VALUE 'daily';
  END IF;
END $$;
