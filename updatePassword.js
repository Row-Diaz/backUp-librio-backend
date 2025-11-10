import bcrypt from 'bcryptjs';
import { pool } from './database/pool.js';

async function updatePassword() {
  const email = 'usuario1@example.com';
  const newPassword = 'password123';
  
  try {
    // Generar hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Actualizar en la base de datos
    const query = 'UPDATE usuarios SET password = $1 WHERE email = $2 RETURNING email, admin';
    const result = await pool.query(query, [hashedPassword, email]);
    
    if (result.rows.length > 0) {
      console.log('✅ Contraseña actualizada exitosamente para:', result.rows[0].email);
      console.log('   Es admin:', result.rows[0].admin);
      console.log('   Nueva contraseña:', newPassword);
    } else {
      console.log('❌ Usuario no encontrado');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updatePassword();
