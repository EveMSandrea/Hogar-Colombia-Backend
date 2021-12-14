import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {Llaves} from '../config/Llaves';
import {Credenciales, Persona} from '../models';
import {PersonaRepository} from '../repositories';
import {AutenticacionService} from '../services';
const fetch = require ('cross-fetch');
export class PersonaController {
  constructor(
    @repository(PersonaRepository)
    public personaRepository : PersonaRepository,
    @service(AutenticacionService)
    public autenticacionService : AutenticacionService
  ) {}
  @post('/identificacionPersona')
  @response(200, {
    description: 'Persona model instance'})
   async identificacionPersona(@requestBody() credenciales : Credenciales){
    console.log("llegue proveniente del front ")
    const persona = await this.autenticacionService.IdentificarPersona(credenciales.usuario,credenciales.clave);
     if(persona){
       console.log("Ya me traje los datos del usuario mongoDB")
       const token = this.autenticacionService.GenerarTokenJWT(persona);
       console.log("ya logre generar token")
       return {
          datos:{
             nombre:persona.nombres +"; "+persona.apellidos,
                id:persona.id
      },
      tk:token
    }
     }else{
      console.log("disculpa la clave no coincide")
      throw new HttpErrors[401]("User not authorizer");
     }

   }

  //@authenticate("admin")
  @post('/personas')
  @response(200, {
    description: 'Persona model instance',
    content: {'application/json': {schema: getModelSchemaRef(Persona)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {
            title: 'NewPersona',
            exclude: ['id'],
          }),
        },
      },
    })
    persona: Omit<Persona, 'id'>,
  ): Promise<Persona> {
    const claveAuto = this.autenticacionService.GenerarClave();
    console.log("Logre generar una clave "+claveAuto)
    const claveCifrada = this.autenticacionService.CifrarClave(claveAuto);
    console.log("Logre cifrar una clave "+claveCifrada)
    persona.clave = claveCifrada
    const personas = await this.personaRepository.create(persona);
    console.log("Logre almacenar en la collecion persona ");
    // Notificar al usuario
    const destino = persona.correo;
    const asunto = 'Registro a nuestra plataforma HogarColombia';
    const contenido = `<br/>Bienvenido..!!\t\t<strong>${persona.nombres}\t\t${persona.apellidos}</strong>,<br/>Gracias por ingresar a nuestra plataforma, su  clave es : <br/><strong>${claveAuto}</strong>`
    fetch(`${Llaves.urlServiceNotification}?correo_destido=${destino}&asunto=${asunto}&contenido=${contenido}`)
    .then((data : any)=>
    {console.log(data)})

    return persona;

  }

  @get('/personas/count')
  @response(200, {
    description: 'Persona model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Persona) where?: Where<Persona>,
  ): Promise<Count> {
    return this.personaRepository.count(where);
  }

  @get('/personas')
  @response(200, {
    description: 'Array of Persona model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Persona, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Persona) filter?: Filter<Persona>,
  ): Promise<Persona[]> {
    return this.personaRepository.find(filter);
  }

  @patch('/personas')
  @response(200, {
    description: 'Persona PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {partial: true}),
        },
      },
    })
    persona: Persona,
    @param.where(Persona) where?: Where<Persona>,
  ): Promise<Count> {
    return this.personaRepository.updateAll(persona, where);
  }

  @get('/personas/{id}')
  @response(200, {
    description: 'Persona model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Persona, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Persona, {exclude: 'where'}) filter?: FilterExcludingWhere<Persona>
  ): Promise<Persona> {
    return this.personaRepository.findById(id, filter);
  }

  @patch('/personas/{id}')
  @response(204, {
    description: 'Persona PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Persona, {partial: true}),
        },
      },
    })
    persona: Persona,
  ): Promise<void> {
    await this.personaRepository.updateById(id, persona);
  }

  @put('/personas/{id}')
  @response(204, {
    description: 'Persona PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() persona: Persona,
  ): Promise<void> {
    await this.personaRepository.replaceById(id, persona);
  }

  @del('/personas/{id}')
  @response(204, {
    description: 'Persona DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.personaRepository.deleteById(id);
  }
}
