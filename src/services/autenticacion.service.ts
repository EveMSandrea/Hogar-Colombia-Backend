import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Llaves} from '../config/Llaves';
import {Persona} from '../models';
import {PersonaRepository} from '../repositories';
const generator = require("password-generator");
const crytoJS= require("crypto-js");
const jwt = require("jsonwebtoken");

@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(
    @repository(PersonaRepository)
    public personaRepository : PersonaRepository
  ) {}

  /*
   * Add service methods here
   */
GenerarClave(){
  let clave = generator(8,false);
  return clave;
}
CifrarClave(clave:string){
  let  claveCifrada = crytoJS.MD5(clave).toString();
  return claveCifrada;
}
IdentificarPersona(usuario : string, clave : string){
  try{
    let persona= this.personaRepository.findOne({where:{correo : usuario, clave : clave}});
     if(persona){
       return persona;
     }
     return false;
  }catch{
    return false;
  }
}
 GenerarTokenJWT(persona : Persona){
    let token=jwt.sign({data:{
       id: persona.id,
       correo: persona.correo,
       nombre: persona.nombres + " " + persona.apellidos
  }
 },
  Llaves.claveJWT);
return token;
 }
  ValidarTokenJWT(token: string){
   try{
    let datos = jwt.verify(token,Llaves.claveJWT);
    return datos;
   }catch{
     return false;
    }

  }
}
