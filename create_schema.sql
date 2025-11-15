-- Tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuarios SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(255),
    apellido VARCHAR(255),
    admin BOOLEAN DEFAULT false,
    foto_perfil TEXT
);

-- Tabla libros
CREATE TABLE IF NOT EXISTS libros (
    id_libros SERIAL PRIMARY KEY,
    titulo VARCHAR(250),
    autor VARCHAR(250),
    editorial VARCHAR(250),
    anio_publicacion DATE,
    genero VARCHAR(250),
    descripcion VARCHAR(2500),
    precio DECIMAL(15, 2),
    url_img VARCHAR(1000),
    estado BOOLEAN,
    usuario_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuarios) ON DELETE CASCADE
);

-- Tabla pedido
CREATE TABLE IF NOT EXISTS pedido (
    id_pedido SERIAL PRIMARY KEY,
    fecha_pedido DATE,
    estado BOOLEAN,
    monto_total NUMERIC,
    usuario_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuarios) ON DELETE CASCADE
);

-- Tabla pedido_libros
CREATE TABLE IF NOT EXISTS pedido_libros (
    pedido_id INT NOT NULL,
    libro_id INT NOT NULL,
    cantidad INT,
    precio_unitario NUMERIC,
    PRIMARY KEY (pedido_id, libro_id),
    FOREIGN KEY (pedido_id) REFERENCES pedido(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (libro_id) REFERENCES libros(id_libros) ON DELETE CASCADE
);
