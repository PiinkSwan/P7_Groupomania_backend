const express = require('express'); //Express indispensable ) notre APP
const mongoose = require('mongoose'); //Utilisation de notre base de données avec MongoDB
const path = require('path'); //Module Node pour la gestion du répertoire images
const helmet = require('helmet'); //Helmet nécessaire à la sécurisation des headers

//Importation des routes
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/posts');

//Mise en place de l'app
const app = express();

const dotenv = require('dotenv');
const result = dotenv.config();
if(result.error){
  throw result.error
}
//Connexion à la base de donnés MongoDB
 mongoose.connect("mongodb+srv://Groupomania:s3HiZWWzBj50AUoN@cluster1.xl8le.mongodb.net/?retryWrites=true&w=majority",
{ useNewUrlParser: true,
  useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//Midlleware permettant d'éviter les erreurs CORS lors des communications back - front
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 
  'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  //Ajout des headers aux requêtes
  res.setHeader('Access-Control-Allow-Methods', 
  'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  //Acceptation des requêtes renseignées
  next();
});

app.use(express.json()); //Remplace bodyParser sur les dernières versions de Express
app.use(helmet()); //utilisation du package Helmet pour sécuriser davantage nos headers
app.use('/images', express.static(path.join(__dirname, 'images'))); //Pour que Express gère le dossier images de manière statique à chaque requête

//Déclaration des routes
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);


module.exports = app;