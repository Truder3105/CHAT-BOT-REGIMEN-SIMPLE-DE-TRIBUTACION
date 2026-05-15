/** Facturación electrónica y DIAN */
export const facturacionElectronica = `
## Facturación electrónica en Colombia
Desde la implementación gradual (2019 en adelante), la DIAN exige facturación electrónica para muchos contribuyentes, con XML firmado, validación de esquemas XSD y eventos (aceptación, rechazo).

### Proceso técnico resumido
1. Generación de documento XML según estándar UBL/DIAN.
2. Firma digital con certificado X.509.
3. Envío/validación ante plataforma autorizada o DIAN según modelo.
4. Almacenamiento y trazabilidad para auditoría.

### Resoluciones y normativa
Consultar portal DIAN para resoluciones vigentes sobre numeración, campos obligatorios y plazos.
`;
