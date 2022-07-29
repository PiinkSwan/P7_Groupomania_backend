//Middleware mis en place pour réguler les tentatives de connexion et éviter certaines attaques
const rateLimit = require("express-rate-limit"); // Utilisation du package Express rate limit

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // Durée de blocage du compte
  max: 5, // Nous avons droit à 5 tentatives de connexion à partir de la même IP avant d'être bloqué durant 10 min
  message:
    "Nous avons constaté de nombreuses tentatives de connexion, cette IP est bloquée durant 10 minutes",
});

module.exports = { limiter }; // Le module doit s'exporter sous forme d'objet