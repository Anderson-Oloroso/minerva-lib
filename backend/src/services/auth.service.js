import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default class AuthService {
    #clientModel;

    constructor(clientModel) {
        this.#clientModel = clientModel;
    }

    async register(data) {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const id = await this.#clientModel.create({
            dpi: data.dpi,
            name: data.name,
            last_name: data.last_name,
            phone: data.phone,
            email: data.email,
            password: hashedPassword,
            role: 'client'
        });

        return {
            id,
            name: `${data.name} ${data.last_name}`,
            email: data.email,
            role: 'client'
        };
    }

    async login(email, password) {
        const client = await this.#clientModel.findByEmail(email);
        if (!client) return null;

        const isValid = await bcrypt.compare(password, client.password);
        if (!isValid) return null;

        const user = {
            id: client.id_client,
            name: client.name_client,
            email: client.email,
            role: client.role
        };

        const token = jwt.sign(user, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRATION || '10min'
        });

        return { user, token };
    }
}