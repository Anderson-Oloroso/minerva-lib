USE minerva_lib_db;

-- 1. Insertar Autores
INSERT INTO authors (id_author, name_author) VALUES 
(1, 'Gabriel García Márquez'),
(2, 'Isabel Allende'),
(3, 'Jorge Luis Borges'),
(4, 'Miguel de Cervantes');

-- 2. Insertar Editoriales
INSERT INTO publishers (id_publisher, name_publisher) VALUES 
(1, 'Editorial Sudamericana'),
(2, 'Alfaguara'),
(3, 'Planeta'),
(4, 'Penguin Random House');

-- 3. Insertar Géneros
INSERT INTO genres (id_genre, name_genre) VALUES 
(1, 'Realismo Mágico'),
(2, 'Ficción'),
(3, 'Ensayo'),
(4, 'Novela Clásica');

-- 4. Insertar Libros (Inventario)
INSERT INTO books (id_book, title, isbn, year_publication, no_pages, wrote_language, price, stock, id_author, id_publisher, id_genre) VALUES 
(1, 'Cien años de soledad', '9780307474728', 1967, 417, 'Español', 125.50, 10, 1, 1, 1),
(2, 'La casa de los espíritus', '9788401024467', 1982, 448, 'Español', 110.00, 8, 2, 2, 2),
(3, 'Ficciones', '9789875666489', 1944, 220, 'Español', 95.00, 5, 3, 3, 3),
(4, 'Don Quijote de la Mancha', '9788420412143', 1605, 863, 'Español', 180.00, 6, 4, 4, 4);

-- 5. Insertar Clientes (Cumpliendo la validación de 13 caracteres del DPI)
INSERT INTO clients (id_client, dpi, name_client, last_name, phone, email) VALUES 
(1, '3012345670101', 'Juan Carlos', 'Pérez Morales', '55123456', 'juan.perez@gmail.com'),
(2, '2987654320102', 'Ana Sofía', 'Rodríguez López', '55987654', 'ana.rodriguez@gmail.com');

-- 6. Insertar Préstamos (Ejemplo de un libro prestado actualmente)
INSERT INTO loans (id_loan, id_client, expected_return_date, return_date, state_loan) VALUES 
(1, 1, '2026-11-01 23:59:59', NULL, 'activo');

-- 7. Detalles del Préstamo (El libro salió en excelente estado y aún no regresa)
INSERT INTO loan_details (id_loan_detail, id_loan, id_book, state_book_out, state_book_in) VALUES 
(1, 1, 1, 'Excelente', NULL);

-- 8. Insertar Ventas (Ejemplo de una compra realizada)
INSERT INTO sales (id_sale, id_client, total) VALUES 
(1, 2, 110.00);

-- 9. Detalles de la Venta (Ana compró 1 ejemplar de 'La casa de los espíritus')
INSERT INTO sale_details (id_sale_details, id_sale, id_book, amount, unit_price) VALUES 
(1, 1, 2, 1, 110.00);