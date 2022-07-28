const db = require('../models');
const jwb = require('jsonwebtoken');


exports.createComment = (req, res, next) => {
    // Nous avons besoin de récupérer l'userId par l'intermédiaire du token, à defaut du store frontend
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
    const userId = decodedToken.userId;
  
    db.Post.findOne({
      where: {
        id: req.params.id || null,
        UserID: userId,
      },
    });
    db.Comment.create({
      comment: req.body.comment,
      PostId: req.params.postId,
      UserId: userId,
    })
      .then(() => res.status(201).json({ message: "Commentaire ajouté !" }))
  
      .catch((error) => res.status(400).json({ error }));
  };
  
  // Obtention de tous les commentaires liés à un post 
  exports.getComments = (req, res, next) => {
    db.Comment.findAll({
      where: {
        PostId: req.params.postId,
      },
      attributes: ["id", "comment", "createdAt", "UserId"],
  
      order: [["createdAt", "DESC"]],
  
      include: [
        {
          model: db.User,
          attributes: ["username", "picture", "id"],
        },
      ],
    })
      .then((comments) => res.status(200).json(comments))
  
      .catch((error) => res.status(500).json({ error }));
  };
  
  // Suppression d'un commentaire
  exports.deleteComment = (req, res, next) => {
    db.Comment.findOne({
      where: {
        id: req.params.id,
      },
    });
    db.Comment.destroy(
      {
        where: {
          id: req.params.id,
        },
      },
      //{ truncate: true }
    )
      .then(() => res.status(200).json({ message: "Commentaire supprimé !" }))
  
      .catch((error) => res.status(400).json({ error }));
  };