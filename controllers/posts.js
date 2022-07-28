const Posts = require('../models/posts');
const fs = require('fs');

// Créer un post
exports.createPost = (req, res, next) => {
    const postsObject = JSON.parse(req.body.post);
    delete postsObject._id
    const posts = new Posts({
        ...postsObject,
        likes: 0,
        imageUrl: req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : "",
        createdDate: new Date(),
    });
    console.log(posts);
    posts.save().then(
        () => {
            res.status(201).json({
                message: 'Post saved successfully!'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};
// Afficher un seul post
exports.getOnePost = (req, res, next) => {
    Posts.findOne({ _id: req.params.id })
        .then(post => res.status(200).json(post))
        .catch(error => res.status(404).json({ error: error }))
}
// Modifier un post
exports.updatePost = (req, res, next) => {
    const postObject = req.file ? {
        ...JSON.parse(req.body.post),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body }
    Posts.updateOne({ _id: req.params.id }, { ...postObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Post modifié.' }))
        .catch(error => res.status(400).json({ error }))
}
// Supprimer un post
exports.deletePost = (req, res, next) => {
    Posts.findOne({ _id: req.params.id })
        .then(post => {
            const filename = post.imageUrl.split('/images/')[1]
            fs.unlink(`images/${filename}`, () => {
                Posts.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Post supprimé.' }))
                    .catch(error => res.status(400).json({ error: error }))
            })
        })
        .catch(error => res.status(500).json({ error }))
};

exports.getAllPosts = (req, res, next) => {
    Posts.sort().find({ createdDate: -1 }).then(
        (posts) => {
            res.status(200).json(posts);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        })
}