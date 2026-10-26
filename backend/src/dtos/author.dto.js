import { body, param } from "express-validator"

export default class createAuthorDTO{
    #name_author // NO olvidar --> Propiedad privada de la clase

    constructor(data){
        this.#name_author = data.name // Prepara el objeto listo para usar
    }

    set name(data){ this.#name_author = data } // Permite cambiarle valor a la variable
    get name (){ return this.#name_author} // Permite leer el dato de forma natural
}
