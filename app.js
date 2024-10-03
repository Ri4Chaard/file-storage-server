const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
    return res.json({ message: "Hello world!" });
});

app.listen(port || 3000, () => {
    console.log(`Server running on port ${port}`);
});
