const express = require('express')
const morgane = require('morgan')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const { Sequelize,DataTypes } = require('sequelize')
const { succes, getUniqueId } = require('./helper.js')
let pokemons = require('./mock-pokemon')
const PokemonModel = require('./src/models/pokemon')
const pokemon = require('./src/models/pokemon')

const app = express()
const port = 3000

const sequelize = new Sequelize(
   'pokedex',
   'root',
   '',
   {
      host: 'localhost',
      dialect:'mariadb',
      dialectOptions:{
         timezone:'Etc/GMT-2'
      },
      logging: false
   }
)
sequelize.authenticate()
   .then(_=>console.log('La connection à la base a bien été établie '))
   .catch(error=>console.error(`Impossible de se connecter a la base ${error}`))

const Pokemon = PokemonModel(sequelize,DataTypes)

sequelize.sync({force:true})
.then(_=>{
   console.log('La base de données "Pokemon" a bien été synchriniséé')
   pokemons.map(pokemon=>{
   Pokemon.create({
   name: pokemon.name,
   hp:pokemon.hp,
   cp:pokemon.cp,
   picture:pokemon.picture,
   types: pokemon.types.join()

   }).then(bulbizzare => console.log(bulbizzare.toJSON()))
})
})
app
   .use(favicon(__dirname + '/favicon.ico' ))
   .use(morgane('dev'))
   .use(bodyParser.json())

app.get('/', (req,res)=>res.send('Hello, Express! 2'))

app.get('/api/pokemon/',(req,res)=>{
   message='all Pokemos are recuperat'
    res.json(succes(message,pokemons))
 })

app.get('/api/pokemon/:id',(req,res)=>{
   const id = parseInt(req.params.id)
   const pokemon = pokemons.find(pokemon =>pokemon.id === id )
   const message ='Un pokemon a bien été trouvé.'
   res.json(succes(message,pokemon))
})

app.post('/api/pokemon', (req, res)=>{
   const id = getUniqueId(pokemons)
   const pokemonCreated = {...req.body,...{id : id, created : new Date()}}
   pokemons.push(pokemonCreated)
   const message = `Le pokemon ${pokemonCreated.name} a bien ete crée`
   res.json(succes(message, pokemonCreated))
})
app.put('/api/pokemon/:id', (req, res)=>{
   const id = parseInt(req.params.id)
   const pokemonUpdated = {...req.body,id:id}
   pokemons = pokemons.map(pokemon =>{
      return pokemon.id === id ? pokemonUpdated : pokemon
   })
   const message = `Le pokemon ${pokemonUpdated.name} a bien été modifié.`
   res.json(succes(message,pokemonUpdated))
})

app.delete('/api/pokemon/:id',(req, res)=>{
   const id = parseInt(req.params.id) 
   const pokemonDeleted = pokemons.find(pokemon => pokemon.id ===id)
   pokemons.filter(pokemon=> pokemon.id!==id)
   const message = `Le pokemon ${pokemonDeleted.name} a bien été suprimé.`
res.json(succes(message,pokemonDeleted))
})




app.listen(port,()=>console.log(`Notre application Node est demarrée sur : http://localhost:${port}`))