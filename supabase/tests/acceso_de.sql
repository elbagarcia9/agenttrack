-- Prueba de la regla del candado de acceso (public.acceso_de) con 15 casos simulados.
-- Se ejecuta en el editor SQL de Supabase: crea personas ficticias DENTRO de una transacción que se deshace sola
-- (el RAISE EXCEPTION del final revierte todo, no queda nada guardado). Resultado esperado en el mensaje:
--   admin true · activa true · prueba_ok true · prueba_vieja false · atrasado_reciente true · atrasado_viejo false ·
--   regalo_siempre true · regalo_vencido false · cancel_en_prueba_vigente true · cancel_en_prueba_vencida false ·
--   cancel_pagada_vigente true · cancel_pagada_vencida false · reembolsada false · sin_plan false · desactivada false
do $$
declare r text := ''; u uuid; t record;
begin
  for t in select * from (values
    ('admin', 'admin', 'activo', null::text, null::timestamptz, null::timestamptz, null::timestamptz, null::text, null::timestamptz, null::timestamptz),
    ('activa', 'usuario', 'activo', 'active', null, null, null, null, null, null),
    ('prueba_ok', 'usuario', 'activo', 'trialing', now() + interval '5 days', null, null, null, null, null),
    ('prueba_vieja', 'usuario', 'activo', 'trialing', now() - interval '5 days', null, null, null, null, null),
    ('atrasado_reciente', 'usuario', 'activo', 'past_due', null, null, null, null, null, now() - interval '2 days'),
    ('atrasado_viejo', 'usuario', 'activo', 'past_due', null, null, null, null, null, now() - interval '9 days'),
    ('regalo_siempre', 'usuario', 'activo', 'manual', null, null, null, 'siempre', null, null),
    ('regalo_vencido', 'usuario', 'activo', 'manual', null, null, null, '14_dias', now() - interval '1 day', null),
    ('cancel_en_prueba_vigente', 'usuario', 'activo', 'cancelled', now() + interval '6 days', null, now(), null, null, null),
    ('cancel_en_prueba_vencida', 'usuario', 'activo', 'cancelled', now() - interval '3 days', null, now() - interval '10 days', null, null, null),
    ('cancel_pagada_vigente', 'usuario', 'activo', 'cancelled', null, now() - interval '10 days', now() - interval '2 days', null, null, null),
    ('cancel_pagada_vencida', 'usuario', 'activo', 'cancelled', null, now() - interval '70 days', now() - interval '45 days', null, null, null),
    ('reembolsada', 'usuario', 'activo', 'refunded', null, null, now(), null, null, null),
    ('sin_plan', 'usuario', 'activo', null, null, null, null, null, null, null),
    ('desactivada', 'usuario', 'desactivado', 'active', null, null, null, null, null, null)
  ) as v(nombre, rol, estado, membresia, trial_ends_at, first_paid_at, cancelado_en, acceso_tipo, acceso_hasta, pago_atrasado_desde)
  loop
    u := gen_random_uuid();
    insert into auth.users (id, email, aud, role) values (u, t.nombre || '@prueba.invalid', 'authenticated', 'authenticated');
    update public.perfiles set rol = t.rol, estado = t.estado, membresia = t.membresia, trial_ends_at = t.trial_ends_at, first_paid_at = t.first_paid_at,
      cancelado_en = t.cancelado_en, acceso_tipo = t.acceso_tipo, acceso_hasta = t.acceso_hasta, pago_atrasado_desde = t.pago_atrasado_desde, ciclo = 'mensual' where id = u;
    r := r || t.nombre || ' => ' || coalesce(public.acceso_de(u) ->> 'ok', 'NULL') || E'\n';
  end loop;
  raise exception E'RESULTADOS\n%', r;
end $$;
