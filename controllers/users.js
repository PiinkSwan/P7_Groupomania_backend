const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const TOKEN = process.env.TOKEN;

//Le mot de passe contient au moins 6 caractères, 1 lettre majuscule, 1 lettre minuscule, 1 chiffre ?
isValidPassword = (password) => {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/.test(password);
};
// Email format validation
isValidEmail = (email) => {
    return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
        email
    );
};
// Email mask ( user1@gmail.com become uXXX1@gmail.com)
maskEmail = (email) => {
    let str = email;
    str = str.split("");
    let finalArr = [];
    let len = str.indexOf("@");
    str.forEach((item, pos) => {
        pos >= 1 && pos <= len - 2
            ? finalArr.push("X")
            : finalArr.push(str[pos]);
    });
    let maskedEmail = finalArr.join("");
    return maskedEmail;
};
// Inscription
exports.signup = (req, res, next) => {
    if (isValidPassword(req.body.password) && isValidEmail(req.body.email)) {
        bcrypt
            .hash(req.body.password, 10)
            .then((hash) => {
                const user = new User({
                    email: req.body.email,
                    password: hash,
                    maskedEmail: maskEmail(req.body.email),
                });
                user.save()
                    .then(() =>
                        res.status(201).json({ message: "Utilisateur créé !" })
                    )
                    .catch((error) => res.status(400).json({ error }));
            })
            .catch((error) => res.status(500).json({ error }));
    } else {
        res.status(401).json({
            message: "Votre mot de passe et/ou email est erroné ",
        });
    }
};
// Connexion avec une adresse mail et mot de passe valide
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (!user) {
                return res.status(401).json({
                    error: "Utilisateur non trouvé ! ",
                });
            }
            bcrypt
                .compare(req.body.password, user.password)
                .then((valid) => {
                    if (!valid) {
                        return res.status(401).json({
                            error: "Mot de passe incorrect ! ",
                        });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign({ userId: user._id }, `${TOKEN}`, {
                            expiresIn: "24h",
                        }),
                    });
                })
            .catch((error) => res.status(500).json({ error }));
        })
    .catch((error) => res.status(500).json({ error }));
};

//Récuparation de tous les users
exports.getAllUsers = (req, res, next) => {
    db.user.findAll ({
        attributes: [
            //Tableau correspond aux informations damandées à la BDD
            "id",
            "firstName",
            "lastName",
            "username",
            "email",
            "description",
            "picture",
        ],
    })
    .then((users) => res.status(200).json(users))

    .catch((error) => res.status(500).json({ error }));
};

//Mise à jour d'un user

exports.updateUser = async (req, res, next) => {
    let newPicture;
    let user = await db.User.findOne({ where: { id: req.params.id } });
    // Await important ! findOne doit s'éxécuter AVANT !
  
    // Si nouvelle image transmise celle-ci est enregistrée
    if (req.file) {
      newPicture = `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`;
    }
  
    // Si nouvelle image, et image précédente existante, cette dernière est supprimée
    if (newPicture && user.picture) {
      const filename = user.picture.split("/images/")[1];
      fs.unlink(`images/${filename}`, (error) => {
        if (error) console.log(error);
        else {
          console.log(`Deleted file: images/${filename}`);
        }
      });
    }
  
    db.User.findOne({
      where: {
        id: req.params.id,
      },
    })
      .then(() => {
        db.User.update(
          {
            username: req.body.username,
            email: req.body.email,
            description: req.body.description,
            picture: newPicture, // Si nouvelle image, son chemin est enregistré dans la BDD
          },
          {
            where: { id: req.params.id },
          }
        )
          .then(() => res.status(200).json({ message: "Compte mis à jour !" }))
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(500).json({ error }));
  };
  
  // Suppression d'un user 
  exports.deleteUser = (req, res, next) => {
    db.User.findOne({
      where: {
        id: req.params.id,
      },
    })
      .then((user) => {
        if (user.picture !== null) {
          // Si photo de profil présente on la supprime du répertoire, puis on supprime l'user de la BDD
          const filename = user.picture.split("/images/")[1];
          fs.unlink(`images/${filename}`, () => {
            db.User.destroy({ where: { id: req.params.id } });
            res.status(200).json({ message: "Compte supprimé !" });
          });
        } else { // Sinon on supprime uniquement l'user
          db.User.destroy({ where: { id: req.params.id } });
          res.status(200).json({ message: "Compte supprimé !" });
        }
      })
  
      .catch((error) => res.status(500).json({ error }));
  };