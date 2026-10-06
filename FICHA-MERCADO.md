# FICHA DE MERCADO — AgentTrack

## Alcance
- Nicho: herramienta móvil de control y alertas de comisiones para agentes de viajes independientes afiliados a agencias Host (Archer/Evolution primero)
- País: México (primero) · Moneda de cobro: MXN (referencia de valor: USD, porque las comisiones de la agencia Host suelen pagarse en USD — por verificar por el usuario)
- Fecha de investigación: 2026-09-29 · **Vence el:** 2027-03-29
- Plataforma de venta: Hotmart (decisión del SO)

## 1. PRECIO
- Competidores (mensual, USD): Travefy $39/$59 · Tern ~$39/asiento · TravelJoy desde $19 (tope 12 viajes/año) | fuente: journeyfuse.com y mtrip.com | 2026-09-29
- Mediana de la categoría: ~$39/mes. Ajuste por país México: NO ENCONTRADO — se decide por criterio, revisar 2027-03-29
- Precio propuesto por el usuario (RESUMEN FINAL): $8.99 USD/mes · $69 USD/año
- **Precio elegido (decisión del agente):** $8.99 USD/mes y $69 USD/año como valor de referencia; en checkout MXN fijar un precio redondo cercano (ej. ~$149 MXN/mes y ~$1,190 MXN/año) al tipo de cambio del día de configuración — VERIFICAR el cambio real al abrir el panel de Hotmart
- Desvío vs mediana: ≈ −77% · Razón: producto acotado (solo comisiones, sin itinerarios/CRM), avatar sensible al costo (<$10/mes, fuente: ANALISIS CLIENTE IDEAL) y meta de reemplazar Excel gratis

## 2. CICLO DE DECISIÓN
- Se compra el mismo día o se piensa: NO ENCONTRADO — se asume decisión rápida (herramienta barata) con prueba; revisar con datos propios
- Ventana mínima antes de declarar fracaso una campaña: 14 días (la duración de la prueba) por criterio, hasta tener datos propios

## 3. CÓMO PAGA ESTE MERCADO
- Medios en Hotmart México: tarjeta de crédito, PayPal, Samsung Pay, Google Pay, OXXO | fuente: help.hotmart.com (Suscripciones) | 2026-09-29. SPEI: mencionado en la web de Hotmart México; NO confirmado para suscripciones
- OXXO en suscripciones: la recurrencia debe estar entre 100 y 10,000 MXN y exige RFC válido | fuente: help.hotmart.com | 2026-09-29
- Penetración de tarjeta de crédito en México: NO ENCONTRADO — revisar
- Consecuencia: el cobro con tarjeta (recurrente automático) cubre a la mayoría de agentes con tarjeta; quien pague con OXXO renueva manualmente → aplicar dunning (58)
- Abrir y MIRAR el checkout real de Hotmart antes de anunciar (regla 18)

## 4. PRUEBA Y GARANTÍA
- Plazos admitidos por Hotmart: NO VERIFICADO — abrir el panel al crear el producto (paso de servicios externos)
- Prueba elegida: 14 días (el valor —ver alertas y cobros— se acumula por semanas y el resumen del usuario pedía 14) · Garantía elegida: 30 días (si Hotmart no admite >14, no se publica la garantía)
- Regla dura: garantía (30) > prueba (14) → SÍ, condicionado a que Hotmart lo permita
- Inicio del plazo de garantía (adhesión o primer cobro): NO CONFIRMADO → el copy dirá el plazo sin fijar fecha de inicio

## 5. CONVERSIÓN ESPERABLE
- NO ENCONTRADO para este nicho — se mide con datos propios (60). Benchmarks genéricos solo para detectar problemas, no para prometer.

## 6. ESTACIONALIDAD Y CONTEXTO
- Picos por temporada de viajes/cierres de mes: NO ENCONTRADO
- Regulación: la app guarda nombre y teléfono de los clientes finales del agente (datos personales de terceros) → política de privacidad y aviso conforme a México (47); no procesa pagos de viajes.

## Economía unitaria (40, resumen)
- Tarifa Hotmart (venta >$15 USD): 9.9% + $1.00 USD fijo; ≤$15 USD: 9.9% + $0.10 USD | fuente: kursopro.com / Estante (2026), verificar en el panel | 2026-09-29. El plan anual ($69) paga la parte fija $1.00; el mensual ($8.99) la parte de $0.10
- Costos de servicio esperados: sin IA · Supabase/Vercel/Resend en plan gratis al empezar → margen bruto alto. Cálculo completo y gate del 40: PENDIENTE (con datos reales de infra)
- Afiliados (34): la comisión de 40-60% puede llevar el margen a ≈0 en venta por afiliado → no ofrecer programa de afiliados hasta cerrar el modelo (40)
