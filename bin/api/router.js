const { Router } = require("express");
const router = Router();

router.get("/api/hello", (req, res) => {
	res.end("HELLO");
});

module.exports = router;
