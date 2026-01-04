
import UserRepository from "../repository/UserRepository";
import PersonalInfoRepository from "../repository/PersonalInfoRepository";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { SignJWT, jwtVerify } from "jose";
import ActivityLogService from "./ActivityLogService";

export default class UserService {
    constructor() {
        this.repository = new UserRepository();
        this.personalInfoRepository = new PersonalInfoRepository();
        this.logService = new ActivityLogService();
    }

    async getAllUsers(role) {
        return await this.repository.getAllUsers(role);
    }

    async getUserById(id) {
        const user = await this.repository.getUserById(id);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    async createUser(userData, adminId) {
        
        if (!userData.full_name || !userData.role) {
            throw new Error("Full name and role are required");
        }

        
        if (userData.email) {
            const existingUser = await this.repository.getUserByEmail(userData.email);
            if (existingUser) {
                throw new Error("Email already registered");
            }
        } else {
          
            userData.email = null;
        }

   
        const plainPassword = userData.password || "temporal123";
        const saltRounds = 10;
        userData.password_hash = await bcrypt.hash(plainPassword, saltRounds);

      
        userData.status = userData.status || 'active';

      
        const { personal_email, ...userFields } = userData;
        const newUser = await this.repository.createUser(userFields);

        if (personal_email) {
            
            await this.personalInfoRepository.create({
                user_id: newUser.id,
                personal_email: personal_email
            });

            await this.sendCredentialsEmail(personal_email, newUser, plainPassword);
            this.logService.logActivity(adminId, `Creó un nuevo usuario: ${newUser.full_name} (Rol: ${newUser.role}).`);
        }

        return newUser;
    }

    async updateUser(id, userData, adminId) {
        const existingUser = await this.repository.getUserById(id);
        if (!existingUser) {
            throw new Error("User not found");
        }

        
        if (userData.email && userData.email !== existingUser.email) {
            const emailCheck = await this.repository.getUserByEmail(userData.email);
            if (emailCheck) {
                throw new Error("Email already in use by another user");
            }
        }

        
        const updatedUser = await this.repository.updateUser(id, {
            full_name: userData.full_name || existingUser.full_name,
            birth_date: userData.birth_date || existingUser.birth_date,
            role: userData.role || existingUser.role,
            status: userData.status || existingUser.status
        });

        
        if (userData.password) {
            const saltRounds = 10;
            const hash = await bcrypt.hash(userData.password, saltRounds);
            await this.repository.updatePassword(id, hash);
        }

        this.logService.logActivity(adminId, `Actualizó los datos del usuario: ${updatedUser.full_name}.`);

        return updatedUser;
    }

    async deleteUser(id, force = false, adminId) {
        const user = await this.repository.getUserById(id);
        if (!user) {
            throw new Error("User not found");
        }

        if (user.role === 'teacher') {
            const assignments = await this.repository.getTeacherAssignments(id);
            const hasAssignments = assignments.groups.length > 0 || assignments.schedules.length > 0;

            if (hasAssignments) {
                if (!force) {
                    const error = new Error("TEACHER_ASSIGNED");
                    error.assignments = assignments;
                    throw error;
                } else {
                    await this.repository.nullifyTeacherReferences(id);
                }
            }
        }

        const deleted = await this.repository.deleteUser(id);
        if (!deleted) {
            throw new Error("User not found or could not be deleted");
        }
        this.logService.logActivity(adminId, `Desactivó al usuario "${user.full_name}".`);
        return { message: "User deleted successfully" };
    }

    async sendCredentialsEmail(to, user, password) {
  
        const transporter = nodemailer.createTransport({
            service: 'gmail', // O tu proveedor SMTP preferido
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const htmlContent = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                <div style="background-color: #1e3a8a; padding: 30px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Bienvenido a EduManager</h1>
                </div>
                
                <div style="padding: 40px 30px;">
                    <p style="font-size: 16px; color: #334155; margin-bottom: 20px;">Hola <strong>${user.full_name}</strong>,</p>
                    <p style="font-size: 16px; color: #475569; line-height: 1.6;">Tu cuenta ha sido creada exitosamente en nuestra plataforma escolar. A continuación encontrarás tus credenciales de acceso personal:</p>
                    
                    <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <div style="margin-bottom: 15px;">
                            <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px;">Correo Institucional</p>
                            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: 700; color: #1e293b;">${user.email || "Pendiente de asignación"}</p>
                        </div>
                        
                        <div>
                            <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px;">Contraseña Temporal</p>
                            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: 700; color: #1e293b;">${password}</p>
                        </div>
                    </div>
                    
                    <p style="font-size: 14px; color: #64748b; margin-bottom: 30px;">Por razones de seguridad, te recomendamos cambiar tu contraseña al iniciar sesión por primera vez.</p>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.3s;">Acceder al Sistema</a>
                    </div>
                </div>
                
                <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 12px; color: #94a3b8;">Este es un mensaje automático, por favor no respondas a este correo.</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8;">&copy; ${new Date().getFullYear()} EduManager. Todos los derechos reservados.</p>
                </div>
            </div>
        `;

        try {
            await transporter.sendMail({
                from: '"Administración Escolar" <no-reply@edumanager.com>',
                to: to,
                subject: '🔐 Tus Credenciales de Acceso - EduManager',
                html: htmlContent
            });
        } catch (error) {
            console.error("Error enviando correo de credenciales:", error);
 
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.repository.getUserById(userId);
        if (!user) {
            throw new Error("Usuario no encontrado.");
        }

        const match = await bcrypt.compare(currentPassword, user.password_hash);
        if (!match) {
            throw new Error("La contraseña actual es incorrecta.");
        }

        const saltRounds = 10;
        const newHash = await bcrypt.hash(newPassword, saltRounds);
        await this.repository.updatePassword(userId, newHash);
    }

    async requestPasswordReset(email) {
        const user = await this.repository.getUserByAnyEmail(email);
        if (!user) {
            
            return;
        }

        
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret_key_change_me');
        const token = await new SignJWT({ id: user.id, email: user.email })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1h')
            .sign(secret);

        
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset_password?token=${token}`;
        await this.sendPasswordResetEmail(email, user.full_name, resetLink);
    }

    async resetPasswordWithToken(token, newPassword) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret_key_change_me');
            const { payload } = await jwtVerify(token, secret);
            
            const userId = payload.id;
            
            const saltRounds = 10;
            const newHash = await bcrypt.hash(newPassword, saltRounds);
            await this.repository.updatePassword(userId, newHash);
        } catch (error) {
            throw new Error("El enlace de recuperación es inválido o ha expirado.");
        }
    }

    async sendPasswordResetEmail(to, name, link) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const htmlContent = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #1e3a8a; text-align: center;">Recuperación de Contraseña</h2>
                <p>Hola <strong>${name}</strong>,</p>
                <p>Hemos recibido una solicitud para restablecer tu contraseña en EduManager.</p>
                <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${link}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Restablecer Contraseña</a>
                </div>
                <p style="font-size: 12px; color: #64748b;">Este enlace expirará en 1 hora. Si no solicitaste esto, puedes ignorar este correo.</p>
            </div>
        `;

        await transporter.sendMail({
            from: '"EduManager Soporte" <no-reply@edumanager.com>',
            to: to,
            subject: '🔑 Restablecer Contraseña - EduManager',
            html: htmlContent
        });
    }
}
