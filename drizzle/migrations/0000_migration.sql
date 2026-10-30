CREATE TABLE public.regions (
  id integer PRIMARY KEY,
  name text NOT NULL,
  grid_x integer NOT NULL,
  grid_y integer NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','reserved','unavailable')),
  owner_id uuid,
  reserved_at timestamptz,
  terrain text,
  resources text[],
  extraction_sites text,
  industrial_land text,
  transport text,
  utilities text,
  market_access text,
  advantages text,
  constraints text,
  start_conditions text,
  usage_fee text,
  UNIQUE (grid_x, grid_y)
);
CREATE UNIQUE INDEX regions_one_per_owner ON public.regions(owner_id) WHERE owner_id IS NOT NULL;
GRANT SELECT ON public.regions TO authenticated;
GRANT ALL ON public.regions TO service_role;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in players can view regions" ON public.regions FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.claim_region(_region_id integer)
RETURNS public.regions LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.regions;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.regions WHERE owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'already_has_region';
  END IF;
  UPDATE public.regions SET status='reserved', owner_id=auth.uid(), reserved_at=now()
   WHERE id=_region_id AND status='available' AND owner_id IS NULL
   RETURNING * INTO r;
  IF r.id IS NULL THEN RAISE EXCEPTION 'region_not_available'; END IF;
  RETURN r;
END $$;
REVOKE ALL ON FUNCTION public.claim_region(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_region(integer) TO authenticated;

INSERT INTO public.regions (id, name, grid_x, grid_y)
SELECT y*20 + x + 1, 'المنطقة ' || (y*20 + x + 1), x, y
FROM generate_series(0,19) x, generate_series(0,11) y;