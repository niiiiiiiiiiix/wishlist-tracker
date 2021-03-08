require("./utils/db");

const app = require("./app");
const PORT = 3009;

const server = app.listen(PORT, () => {
  console.log(`Express app started on http://localhost:${PORT}`);
});