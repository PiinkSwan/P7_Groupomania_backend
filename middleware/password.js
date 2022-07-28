// Mise en place de critères pour la création d'un mot de passe
const passwordValidator = require('password-validator'); //On utilise le package password-validator pour cela

const passwordSchema = new passwordValidator(); //En créant le shéma demandé par la doc

//CRITÉRES DEMANDÉ
passwordSchema
.is().min(6) // 6 caractères min
.is().max(40) // 40 caractères max
.has().uppercase() // Doit contenir des majuscules
.has().lowercase() // Et des minuscules
.has().digits() // Au moins un chiffre
.has().not().spaces() // Pas d'espaces
.is().not().oneOf(["Password", "Pwd", "Password123", "Pwd123", "AZERTY", "QWERTY"]); // Ne doit pas être ces mots de passe

module.exports = passwordSchema;


//Le module fournit une validation de base des mots de passe
module.exports = (req, res, next) => {
    if (!passwordSchema.validate(req.body.password)) {
      return res
        .status(401)
        .json({
          message:
            "le mot de passe n'est pas bon" +
            passwordSchema.validate("password", { list: true }),
        });
    } else {
      next();
    }
  };

module.exports = passwordSchema;