// =========================== dependencies start here =========================== // 
const express = require('express');
const router = express.Router();

router.use(require('./candidateRoutes'));
router.use(require('./partyRoutes'));
router.use(require('./voterRoutes'));
router.use(require('./voteRoutes'));
// =========================== dependencies end here =========================== // 

module.exports = router;