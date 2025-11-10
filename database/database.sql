-- Crear la base de datos

CREATE DATABASE libreria;

-- Tabla de usuarios

CREATE TABLE usuarios (
  id_usuarios SERIAL PRIMARY KEY, 
  email VARCHAR(75) NOT NULL, 
  password VARCHAR(1000) NOT NULL, 
  nombre VARCHAR(50) NOT NULL, 
  apellido VARCHAR(50) NOT NULL,
  admin BOOLEAN DEFAULT false
);

-- Tabla de libros

CREATE TABLE libros (
  id_libros SERIAL PRIMARY KEY,
  titulo VARCHAR(250),
  autor VARCHAR(250),
  editorial VARCHAR(250),
  anio_publicacion INT,
  genero VARCHAR(4),
  descripcion VARCHAR(2500),
  precio DECIMAL(15, 2),
  url_img VARCHAR(1000),
  estado BOOLEAN,
  usuario_id INT NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuarios) ON DELETE CASCADE
);

-- Tabla de pedidos

CREATE TABLE pedido (
  id_pedido SERIAL PRIMARY KEY,
  fecha_pedido DATE,
  estado BOOLEAN DEFAULT false,
  monto_total DECIMAL(20, 2),
  usuario_id INT NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuarios)
);

-- Tabla intermedia pedido_libros

CREATE TABLE pedido_libros (
  id_pedido_libro SERIAL PRIMARY KEY,
  pedido_id INT NOT NULL,
  libro_id INT NOT NULL,
  cantidad INT,
  precio_unitario DECIMAL(15, 2),
  FOREIGN KEY (pedido_id) REFERENCES pedido(id_pedido) ON DELETE CASCADE,
  FOREIGN KEY (libro_id) REFERENCES libros(id_libros) ON DELETE CASCADE
);

SELECT * FROM usuarios;

-- le da privilegio de admin a un unser por id

UPDATE usuarios SET admin = true WHERE id_usuarios = 1; // Dar permisos de admin a usuario existente

-- ingreso de 20 libros para prueba de pedidos

INSERT INTO libros (
  titulo, autor, editorial, anio_publicacion, genero, descripcion, precio, url_img, estado, usuario_id
) VALUES
('Cien años de soledad', 'Gabriel García Márquez', 'Editorial Sudamericana', 1967, 'Realismo mágico', 'La historia épica de la familia Buendía en el pueblo ficticio de Macondo.', 25.50, 'https://example.com/cien-anos.jpg', true, 1),

('1984', 'George Orwell', 'Secker & Warburg', 1949, 'Distopía', 'Una novela que explora la vigilancia estatal y la opresión totalitaria.', 18.99, 'https://example.com/1984.jpg', true, 1),

('El señor de los anillos: La comunidad del anillo', 'J.R.R. Tolkien', 'Allen & Unwin', 1954, 'Fantasía épica', 'El inicio del viaje para destruir el Anillo Único.', 30.00, 'https://example.com/lotr1.jpg', true, 1),

('Don Quijote de la Mancha', 'Miguel de Cervantes', 'Francisco de Robles', 1605, 'Clásico', 'Las aventuras del ingenioso hidalgo que confundió la realidad con la fantasía.', 22.00, 'https://example.com/don-quijote.jpg', true, 1),

('Harry Potter y la piedra filosofal', 'J.K. Rowling', 'Bloomsbury', 1997, 'Fantasía', 'El joven mago Harry Potter descubre su destino en Hogwarts.', 20.50, 'https://example.com/harry1.jpg', true, 1),

('El código Da Vinci', 'Dan Brown', 'Doubleday', 2003, 'Thriller', 'Un misterio religioso que combina arte, historia y secretos antiguos.', 19.99, 'https://example.com/da-vinci.jpg', true, 1),

('Los juegos del hambre', 'Suzanne Collins', 'Scholastic Press', 2008, 'Ciencia ficción', 'Katniss Everdeen lucha por sobrevivir en un brutal concurso televisado.', 17.75, 'https://example.com/hunger-games.jpg', true, 1),

('Crónica de una muerte anunciada', 'Gabriel García Márquez', 'Editorial Oveja Negra', 1981, 'Realismo mágico', 'La historia del asesinato anunciado de Santiago Nasar.', 15.25, 'https://example.com/cronica.jpg', true, 1),

('La sombra del viento', 'Carlos Ruiz Zafón', 'Planeta', 2001, 'Misterio', 'Un joven descubre un libro que cambiará su vida en la Barcelona de posguerra.', 24.00, 'https://example.com/sombra-viento.jpg', true, 1),

('It', 'Stephen King', 'Viking Press', 1986, 'Terror', 'Un grupo de amigos enfrenta a una entidad malévola que cambia de forma.', 28.50, 'https://example.com/it.jpg', true, 1),

('Fahrenheit 451', 'Ray Bradbury', 'Ballantine Books', 1953, 'Ciencia ficción', 'Un futuro donde los libros están prohibidos y los bomberos los queman.', 16.99, 'https://example.com/fahrenheit.jpg', true, 1),

('Orgullo y prejuicio', 'Jane Austen', 'T. Egerton', 1813, 'Romance', 'La historia de Elizabeth Bennet y el señor Darcy.', 14.50, 'https://example.com/orgullo.jpg', true, 1),

('El alquimista', 'Paulo Coelho', 'HarperCollins', 1988, 'Ficción filosófica', 'Un joven pastor emprende un viaje para cumplir su leyenda personal.', 19.00, 'https://example.com/alquimista.jpg', true, 1),

('Drácula', 'Bram Stoker', 'Archibald Constable', 1897, 'Terror', 'El clásico de vampiros que inspiró a generaciones.', 17.00, 'https://example.com/dracula.jpg', true, 1),

('Matar a un ruiseñor', 'Harper Lee', 'J.B. Lippincott & Co.', 1960, 'Drama', 'Una poderosa historia sobre la injusticia racial en el sur de Estados Unidos.', 21.25, 'https://example.com/ruisenor.jpg', true, 1),

('El principito', 'Antoine de Saint-Exupéry', 'Reynal & Hitchcock', 1943, 'Infantil', 'Una fábula poética sobre la vida, la amistad y el amor.', 12.99, 'https://example.com/principito.jpg', true, 1),

('La metamorfosis', 'Franz Kafka', 'Kurt Wolff Verlag', 1915, 'Existencialismo', 'Un hombre despierta convertido en un insecto gigante.', 13.50, 'https://example.com/metamorfosis.jpg', true, 1),

('Rayuela', 'Julio Cortázar', 'Sudamericana', 1963, 'Experimental', 'Una novela abierta que redefine la narrativa contemporánea.', 23.75, 'https://example.com/rayuela.jpg', true, 1),

('El nombre del viento', 'Patrick Rothfuss', 'DAW Books', 2007, 'Fantasía', 'La historia de Kvothe, un mago legendario que relata su vida.', 27.00, 'https://example.com/nombre-viento.jpg', true, 1),

('Los pilares de la tierra', 'Ken Follett', 'Macmillan', 1989, 'Histórica', 'La construcción de una catedral en la Edad Media y las vidas que la rodean.', 29.99, 'https://example.com/pilares.jpg', true, 1);



INSERT INTO usuarios (id_usuarios, email, password, nombre, apellido, admin)
VALUES 
  (1, 'usuario1@example.com', 'password123', 'Juan', 'Pérez', false),
  (2, 'usuario2@example.com', 'password456', 'María', 'Gómez', false);


DELETE from usuarios WHERE id_usuarios = 1; // Eliminar usuario de prueba si existe