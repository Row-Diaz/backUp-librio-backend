import { jest } from "@jest/globals";
import request from "supertest";
import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";

//la funcion mock hace que no interactuemos con la base de datos real

const mockAddUser = jest.fn();
const mockLoginUser = jest.fn();
const mockGetUserById = jest.fn();
const mockDeleteUser = jest.fn();

// se le hace el mock a las funciones que usarmos en las rutas

jest.unstable_mockModule("../queries/queriesUsuarios.js", () => ({
  addUser: mockAddUser,
  loginUser: mockLoginUser,
  getUserById: mockGetUserById,
  deleteUser: mockDeleteUser,
}));

// traemos nuestra app para hacer las pruebas

const { default: app } = await import("../index.js");

describe("🧪 Pruebas de usuarios (mockeadas)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // acá comienza el primer test para hacer un registro de usuario

  describe("Registro de usuario", () => {
    beforeAll(() => {
      mockAddUser.mockResolvedValueOnce();
    });

      // parametros que le pasamos a la ruta

    it("Debería registrar un nuevo usuario correctamente", async () => {
      const nuevoUsuario = {
        email: "test@example.com",
        password: "123456",
        nombre: "Juan",
        apellido: "Pérez",
      };

      const response = await request(app)
        .post("/usuarios")
        .send(nuevoUsuario)
        .set("Accept", "application/json");

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: "Usuario agregado con éxito" });
      expect(mockAddUser).toHaveBeenCalledWith(
        "test@example.com",
        "123456",
        "Juan",
        "Pérez"
      );
    });
  });


  // segundo test para hacer login de usuario

  describe("Login de usuario", () => {
    it("Debería permitir el login con credenciales válidas", async () => {
      
      // Simulamos que loginUser retorna un token JWT falso
      mockLoginUser.mockResolvedValueOnce("fake.jwt.token");

      const credenciales = {
        email: "test@example.com",
        password: "123456",
      };

      const response = await request(app)
        .post("/login")
        .send(credenciales)
        .set("Accept", "application/json");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ token: "fake.jwt.token" });
      expect(mockLoginUser).toHaveBeenCalledWith("test@example.com", "123456");
    });

    //segunda parte del test de login con credenciales invalidas

    it("Debería retornar error con credenciales inválidas", async () => {
      mockLoginUser.mockRejectedValueOnce(new Error("Credenciales inválidas"));

      const credencialesInvalidas = {
        email: "wrong@example.com",
        password: "incorrecta",
      };

      const response = await request(app)
        .post("/login")
        .send(credencialesInvalidas)
        .set("Accept", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Credenciales inválidas" });
      expect(mockLoginUser).toHaveBeenCalledWith(
        "wrong@example.com",
        "incorrecta"
      );
    });
  });
});