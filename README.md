/**
 * Cavosh Cafe POS API - Express.js Migration
 * 
 * Drop, create, and seed the database:
 *   mysql -u root < src/data/schema.sql
 *
 * Run the API (auto-seeds on first start if DB is empty):
 *   npm run dev
 *
 * API base URL: http://localhost:8080
 * All routes are prefixed with /api
 *
 * ============================================================================
 * ENDPOINTS SUMMARY
 * ============================================================================
 *
 * --- Auth ---
 * POST   /api/auth/login                    Login (body: email, password)
 * POST   /api/auth/registrar                Register user (body: nombreCompleto, email, password)
 * GET    /api/auth/perfil/{idUsuario}       Get user profile
 * PUT    /api/auth/perfil/{idUsuario}/preferencias?notificaciones=&ubicacion=  Update preferences
 *
 * --- Productos ---
 * GET    /api/productos                     List products (optional ?categoria=...)
 * GET    /api/productos/nuevos              List "new" products
 * GET    /api/productos/frecuentes         List "frequent" products
 * GET    /api/productos/buscar?q=...        Search products
 * GET    /api/productos/{id}                Get product by ID
 *
 * --- Sucursales ---
 * GET    /api/sucursales                   List all branches
 * GET    /api/sucursales/ciudad?ciudad=...  List branches by city
 * GET    /api/sucursales/{id}              Get branch by ID
 *
 * --- Carrito ---
 * POST   /api/carrito                       Add item to cart (body: idUsuario, idProducto, cantidad, ...)
 * GET    /api/carrito/{idUsuario}           Get cart summary
 * PUT    /api/carrito/{idCarrito}/usuario/{idUsuario}?cantidad=N  Update quantity
 * DELETE /api/carrito/{idCarrito}/usuario/{idUsuario}            Remove item
 * DELETE /api/carrito/vaciar/{idUsuario}    Clear cart
 *
 * --- Cupones ---
 * POST   /api/cupones/validar               Validate coupon (body: codigo, subtotal)
 *
 * --- Favoritos ---
 * GET    /api/favoritos/{idUsuario}         List favorites for user
 * POST   /api/favoritos/toggle?idUsuario=1&idProducto=2    Toggle favorite
 * GET    /api/favoritos/check?idUsuario=1&idProducto=2      Check if favorite
 *
 * --- Pedidos ---
 * POST   /api/pedidos                       Create order (body: idUsuario, idSucursal, ...)
 * GET    /api/pedidos/{id}                 Get order by ID
 * GET    /api/pedidos/tracking/{numero}     Get order by number
 * GET    /api/pedidos/usuario/{idUsuario}  List orders for user
 *
  * ============================================================================
  * RESPONSE FORMAT (all endpoints)
  * ============================================================================
  *   { success, error, message, status, timestamp, data }
  *
  *   Success:
  *     { "success": true, "error": false, "message": "...",
  *       "status": 200, "timestamp": "...", "data": <payload> }
  *
  *   Error:
  *     { "success": false, "error": true, "message": "...",
  *       "status": 404, "timestamp": "...", "data": null }
  *
  *   HTTP status codes: 200 OK, 400 Bad Request, 404 Not Found, 500 Server Error
 *
 * ============================================================================
 * TEST USER
 * ============================================================================
 *   email:     usuario@cavosh.com
 *   password:  123456
 *   idUsuario: 1
 */
