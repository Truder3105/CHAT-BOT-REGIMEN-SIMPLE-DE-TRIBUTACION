/** Seguridad informática del sistema */
export const seguridad = `
## Seguridad del sistema
- TLS 1.2/1.3 para tránsito.
- Cifrado en reposo (AES-256) donde aplique.
- AWS KMS para gestión de claves.
- RBAC, JWT y sesiones seguras.
- Validación y sanitización de entradas.
- PKI / firma XML con certificados X.509.
- Credenciales en variables de entorno; contraseñas con hash (bcrypt).
- Backups automatizados (RDS snapshots).
`;
