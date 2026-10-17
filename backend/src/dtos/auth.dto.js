import { body } from 'express-validator' ;

export default class AuthDTO{
    #dpi
    #name_client
    #last_name
    #phone
    #email
    #password
    #role  // NO olvidar --> Propiedad privada de la clase

    constructor(data){
      this.#dpi = data.dpi;
      this.#name_client = data.name;
      this.#last_name = data.last_name;
      this.#phone = data.phone;
      this.#email = data.email;
      this.#password = data.password;
    }
    
    get doc(){ return this.#dpi };
    get name(){ return this.#name_client };
    get last_name(){ return this.#last_name};
    get phone(){ return this.#phone };
    get email(){ return this.#email };
    get password(){ return this.#password };
    get role(){ return this.#role};
}

// Validaciones de creacion
export const validationsRegister = [
  body('dpi')
    .trim()
    .notEmpty().withMessage('El DPI es obligatorio')
    .isLength({ min: 13, max: 13 }).withMessage('El DPI debe tener exactamente 13 caracteres numéricos')
    .isString().withMessage('El DPI es un conjunto de 13 números, no texto'),

  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),

  body('last_name')
    .trim()
    .notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ min: 2, max: 50 }).withMessage('El apellido no puede tener menos de 2 caracteres'),

  body('phone')
    .trim()
    .notEmpty().withMessage('El teléfono es obligatorio')
    .isLength({ min: 8, max: 8 }).withMessage('El teléfono debe tener 8 dígitos'),

  body('email')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio')
    .isEmail().withMessage('Debe ser un correo electrónico válido'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/\d/).withMessage('La contraseña debe contener al menos un número')
];

//Validaciones de login
export const validationsLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio')
    .isEmail().withMessage('Debe ser un correo válido'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
];