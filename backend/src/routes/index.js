const express = require('express'); const router = express.Router();
router.use('/funcionarios', require('./funcionarios'));
router.use('/eventos', require('./eventos'));
module.exports = router;
