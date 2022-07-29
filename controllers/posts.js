const db = require("../models"); // Récupération des modèles Sequelize
const fs = require("fs"); // FS est un module de Node permettant les opérations sur les fichiers
const jwt = require("jsonwebtoken"); // Jwt necessaire pour la gestion d'un token

// Création d'un post ---------------------------------------------------------------------------------
exports.createPost = (req, res, next) => {
  // Nous avons besoin de récupérer l'userId par l'intermédiaire du token, à defaut du store frontend
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
  const userId = decodedToken.userId;

  // Nous cherchons ensuite l'user correspondant
  db.User.findOne({
    attributes: ["id", "username", "picture"],
    where: {
      id: userId,
    },
  })
    // Et enregistrons son image, si présente
    .then(() => {
      let imageUrl;
      if (req.file) {
        imageUrl = `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`;
      } else {
        imageURL = null;
      }

      // Puis on renseigne le post dans la BDD
      db.Post.create({
        message: req.body.message,
        imageURL: imageUrl,
        link: req.body.link,
        UserId: userId,
      }).then(() => res.status(201).json({ message: "Post créé !" }));
    })

    .catch((error) => res.status(400).json({ error }));
};

// Obtention d'un post par son id ------------------------------------------------------------------
exports.getOnePost = (req, res, next) => {
  db.Post.findOne({
    where: {
      id: req.params.id,
    },
    // On inclue également les infos user, like, comment, liées au post, qui nous serons utiles 
    include: [
      {
        model: db.User,
        attributes: ["username", "picture", "id"],
      },
      {
        model: db.Like,
        attributes: ["PostId", "UserId"],
        include: [
          {
            model: db.User,
            attributes: ["username", "picture"],
          },
        ],
      },
      {
        model: db.Comment,
        order: [["createdAt", "DESC"]], // Affichage des commentaires dans un ordre donné
        attributes: ["id", "comment", "UserId"],
        include: [
          {
            model: db.User,
            attributes: ["username", "picture"],
          },
        ],
      },
    ],
  })
    .then((post) => res.status(200).json(post))

    .catch((error) => res.status(500).json({ error }));
};

// Obtention de tout posts confondus ---------------------------------------------------------------
exports.getAllPosts = (req, res, next) => {
  db.Post.findAll({
    attributes: [
      "id",
      "message",
      "imageURL",
      "link",
      "createdAt",
      "updatedAt",
      "UserId",
    ],

    order: [["createdAt", "DESC"]],

    include: [
      {
        model: db.User,
        attributes: ["username", "picture", "id"],
      },
      {
        model: db.Like,
        attributes: ["PostId", "UserId"],
        include: [
          {
            model: db.User,
            attributes: ["username", "picture"],
          },
        ],
      },
      {
        model: db.Comment,
        order: [["createdAt", "DESC"]],
        attributes: ["id", "comment", "UserId", "createdAt"],
        include: [
          {
            model: db.User,
            attributes: ["username", "picture"],
          },
        ],
      },
    ],
  })
    .then((posts) => res.status(200).json(posts))

    .catch((error) => res.status(500).json({ error }));
};

// Mise à jour d'un post -----------------------------------------------------------------------------
exports.updatePost = async (req, res, next) => {
  let newImageUrl;
  let post = await db.Post.findOne({ where: { id: req.params.id } });
  // Await important ! findOne doit s'éxécuter AVANT post.imageURL !

  // Si nouvelle image celle ci est enregistrée
  if (req.file) {
    newImageUrl = `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`;
  }

  // Si nouvelle image, et image précédente existante, cette dernière est supprimée
  if (newImageUrl && post.imageURL) {
    const filename = post.imageURL.split("/images/")[1];
    fs.unlink(`images/${filename}`, (error) => {
      if (error) console.log(error);
      else {
        console.log(`Deleted file: images/${filename}`);
      }
    });
  }

  db.Post.findOne({
    where: {
      id: req.params.id,
    },
  })
    .then(() => {
      db.Post.update(
        {
          message: req.body.message,
          imageURL: newImageUrl, // Si nouvelle image, son chemin est enregistré dans la BDD
          link: req.body.link,
        },
        {
          where: { id: req.params.id },
        }
      )
        .then(() => res.status(200).json({ message: "Post mis à jour !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Suppression d'un post -------------------------------------------------------------------
exports.deletePost = (req, res, next) => {
  db.Post.findOne({
    where: {
      id: req.params.id,
    },
  })
    .then((post) => {
      if (post.imageURL !== null) {
        // Si image présente on la supprime du répertoire, puis on supprime le post de la BDD
        const filename = post.imageURL.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          db.Post.destroy(
            { where: { id: post.id } },
            { truncate: true, restartIdentity: true }
          );
          res.status(200).json({ message: "Post supprimé !" });
        });
      } else { // Sinon on supprime uniquement le post
        db.Post.destroy(
          { where: { id: post.id } },
          { truncate: true, restartIdentity: true }
        );
        res.status(200).json({ message: "Post supprimé !" });
      }
    })

    .catch((error) => res.status(500).json({ error }));
};