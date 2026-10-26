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