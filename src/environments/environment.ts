/**
 * Configuración usada por la compilación de producción (`ng build`).
 * El frontend solo habla con Spring Boot; nunca con PostgreSQL.
 */
export const environment = {
  production: true,
  apiUrl: 'http://[::1]:8080/api',
};