//Mise ne place des routes concernant des posts
const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config'); //Multer gère l'upload des fichiers
const auth = require('../middleware/auth'); // Authentification des routes via token

const userCtrl = require('../controllers/users') // Utilsiation du controlleur User
const pwdCtrl = require('../middleware/password'); // Importation du schéma permettant de contrôler la création de password
const max = require("../middleware/limiter"); // Utilisation d'un limiter pour éviter les trop nombreuses tentatives de connexion

router.post('/auth/signup', pwdCtrl, userCtrl.signup); // Création d'un nouvel user avec contrôle du format de password
router.post('/auth/login', max.limiter, userCtrl.login); // Connexion d'un user existant, avec limitation de connexion
router.get('/accounts', auth, userCtrl.getAllUsers); // Récupération de tous les users
router.get('/accounts/:id', auth, userCtrl.getUser); // Récupération des informations d'un user
router.put('/accounts/:id', auth, multer, userCtrl.updateUser); // Mise à jour d'un user
router.delete('/accounts/:id', auth, multer, userCtrl.deleteUser); // Suppression d'un user

module.exports = router; // Exportation du router