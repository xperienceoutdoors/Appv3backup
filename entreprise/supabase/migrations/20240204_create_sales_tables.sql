-- Create reservation_payments table
CREATE TABLE IF NOT EXISTS public.reservation_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('carte', 'espèces', 'virement', 'chèque')),
    status TEXT NOT NULL CHECK (status IN ('confirmé', 'en attente', 'annulé')),
    reference TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create modification_history table
CREATE TABLE IF NOT EXISTS public.modification_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    description TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reservation_payments_reservation_id ON public.reservation_payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_modification_history_reservation_id ON public.modification_history(reservation_id);

-- Add RLS policies
ALTER TABLE public.reservation_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modification_history ENABLE ROW LEVEL SECURITY;

-- Create policies for reservation_payments
CREATE POLICY "Enable read access for authenticated users" ON public.reservation_payments
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.reservation_payments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.reservation_payments
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policies for modification_history
CREATE POLICY "Enable read access for authenticated users" ON public.modification_history
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.modification_history
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reservation_payments_updated_at
    BEFORE UPDATE ON public.reservation_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add function to get reservation total payments
CREATE OR REPLACE FUNCTION get_reservation_total_payments(reservation_id UUID)
RETURNS DECIMAL AS $$
    SELECT COALESCE(SUM(amount), 0)
    FROM public.reservation_payments
    WHERE reservation_id = $1 AND status = 'confirmé';
$$ LANGUAGE SQL;
